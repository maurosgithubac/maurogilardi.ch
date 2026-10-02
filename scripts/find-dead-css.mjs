#!/usr/bin/env node
/**
 * find-dead-css.mjs — findet (und entfernt optional) CSS-Klassenselektoren,
 * deren Klassennamen im Quellcode nirgends vorkommen.
 *
 * Usage:
 *   node scripts/find-dead-css.mjs --report src/app/globals.css [weitere.css ...]
 *   node scripts/find-dead-css.mjs --write  src/app/globals.css src/app/site-refresh.css
 *
 * Optionen:
 *   --report          nur auflisten (Default)
 *   --write           tote Regeln/Selektoren aus der Datei entfernen
 *   --src <dir>       Quellverzeichnis (mehrfach möglich, Default: src)
 *   --keep <regex>    Klassen, die immer als benutzt gelten (mehrfach möglich)
 *   --verbose         zusätzlich alle erkannten dynamischen Präfixe/Suffixe ausgeben
 *
 * Logik:
 *   - Eine Klasse gilt als benutzt, wenn ihr Name irgendwo in src/**\/*.{ts,tsx,js,jsx,mdx}
 *     als Substring vorkommt, oder wenn sie mit einem dynamischen Präfix beginnt
 *     (z.B. `foo--${x}` oder "foo--" + x) bzw. mit einem dynamischen Suffix endet (`${x}-title`).
 *   - Ein Selektor ist tot, wenn er mindestens eine tote Klasse ausserhalb von
 *     funktionalen Pseudo-Klassen (:not, :is, :where, :has, ...) enthält — ein solcher
 *     Selektor kann nie matchen. Selektoren ohne Klassen (Element, :root, body, html,
 *     Attribut-, Pseudo-only) gelten nie als tot.
 *   - --write: Regel löschen, wenn alle Selektoren tot sind; sonst nur tote Selektoren
 *     aus der Liste streichen. Leere @media/@supports/@container/@layer-Blöcke werden entfernt.
 *     @keyframes, @font-face, @theme etc. werden nie angefasst.
 */
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);
const PRUNABLE_AT_RULES = new Set(["media", "supports", "container", "layer"]);
const SKIP_AT_RULES = new Set(["keyframes", "-webkit-keyframes", "font-face", "theme", "property", "page"]);

function parseArgs(argv) {
  const opts = { mode: "report", src: [], keep: [], files: [], verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--report") opts.mode = "report";
    else if (a === "--write") opts.mode = "write";
    else if (a === "--verbose") opts.verbose = true;
    else if (a === "--src") opts.src.push(argv[++i]);
    else if (a === "--keep") opts.keep.push(new RegExp(argv[++i]));
    else if (a.startsWith("--")) throw new Error(`Unbekannte Option: ${a}`);
    else opts.files.push(a);
  }
  if (opts.src.length === 0) opts.src.push("src");
  if (opts.files.length === 0) {
    console.error("Usage: node scripts/find-dead-css.mjs [--report|--write] [--src dir] [--keep regex] <file.css> ...");
    process.exit(1);
  }
  return opts;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/** Liest alle Quellen und sammelt dynamische Präfixe/Suffixe. */
export function loadSources(srcDirs) {
  const files = srcDirs.flatMap((d) => walk(d));
  const text = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  const prefixes = new Set();
  const suffixes = new Set();
  // `foo-bar--${x}` (Template-Literal)
  for (const m of text.matchAll(/([A-Za-z_][\w-]*[-_])\$\{/g)) prefixes.add(m[1]);
  // "foo-bar--" + x  bzw.  "a foo-" + x
  for (const m of text.matchAll(/["'`](?:[^"'`\n]*\s)?([A-Za-z_][\w-]*[-_])["'`]\s*\+/g)) prefixes.add(m[1]);
  // `${x}-title`  bzw.  x + "-title"
  for (const m of text.matchAll(/\}([-_][\w-]*[A-Za-z0-9])/g)) suffixes.add(m[1]);
  for (const m of text.matchAll(/\+\s*["'`]([-_][\w-]*[A-Za-z0-9])/g)) suffixes.add(m[1]);
  return { files, text, prefixes, suffixes };
}

export function makeIsUsed({ text, prefixes, suffixes }, keep = []) {
  const cache = new Map();
  return (cls) => {
    if (cache.has(cls)) return cache.get(cls);
    let used =
      text.includes(cls) ||
      keep.some((re) => re.test(cls)) ||
      [...prefixes].some((p) => cls.length > p.length && cls.startsWith(p)) ||
      [...suffixes].some((s) => cls.length > s.length && cls.endsWith(s));
    cache.set(cls, used);
    return used;
  };
}

/** Entfernt Strings und Attribut-Selektoren, damit dort keine "Klassen" gefunden werden. */
function stripNoise(sel) {
  return sel.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""').replace(/\[[^\]]*\]/g, "[]");
}

const CLASS_RE = /\.((?:\\.|[\w-])+)/g;
const unescape = (s) => s.replace(/\\(.)/g, "$1");

/**
 * Liefert { top, nested }: Klassen auf oberster Ebene (müssen alle existieren, damit der
 * Selektor matcht) und Klassen innerhalb funktionaler Pseudo-Klassen.
 */
export function selectorClasses(selector) {
  const s = stripNoise(selector);
  let depth = 0;
  let top = "";
  let nested = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (depth === 0) top += ch;
    else nested += ch;
    if (ch === ")") depth = Math.max(0, depth - 1);
  }
  const grab = (str) => [...str.matchAll(CLASS_RE)].map((m) => unescape(m[1])).filter((c) => !/^\d/.test(c));
  return { top: grab(top), nested: grab(nested) };
}

function insideSkippedAtRule(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === "atrule" && SKIP_AT_RULES.has(p.name.toLowerCase())) return true;
  }
  return false;
}

function pruneEmptyAtRules(root) {
  let changed = true;
  let removed = 0;
  while (changed) {
    changed = false;
    root.walkAtRules((at) => {
      if (!PRUNABLE_AT_RULES.has(at.name.toLowerCase()) || !at.nodes) return;
      if (at.nodes.every((n) => n.type === "comment")) {
        at.remove();
        removed++;
        changed = true;
      }
    });
  }
  return removed;
}

export function analyzeCss(css, from, isUsed) {
  const root = postcss.parse(css, { from });
  const deadRules = [];
  const partialRules = [];
  root.walkRules((rule) => {
    if (insideSkippedAtRule(rule)) return;
    const selectors = rule.selectors;
    const dead = [];
    for (const sel of selectors) {
      const { top } = selectorClasses(sel);
      const deadClasses = top.filter((c) => !isUsed(c));
      if (deadClasses.length > 0) dead.push({ sel, deadClasses });
    }
    if (dead.length === 0) return;
    const entry = { rule, line: rule.source?.start?.line, selectors, dead };
    if (dead.length === selectors.length) deadRules.push(entry);
    else partialRules.push(entry);
  });
  return { root, deadRules, partialRules };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const sources = loadSources(opts.src);
  const isUsed = makeIsUsed(sources, opts.keep);
  console.log(`Quellen: ${sources.files.length} Dateien in ${opts.src.join(", ")}`);
  if (opts.verbose) {
    console.log(`Dynamische Präfixe: ${[...sources.prefixes].sort().join(" ")}`);
    console.log(`Dynamische Suffixe: ${[...sources.suffixes].sort().join(" ")}`);
  }

  for (const file of opts.files) {
    const css = fs.readFileSync(file, "utf8");
    const { root, deadRules, partialRules } = analyzeCss(css, file, isUsed);
    const deadClassSet = new Set();
    for (const e of [...deadRules, ...partialRules]) for (const d of e.dead) d.deadClasses.forEach((c) => deadClassSet.add(c));

    console.log(`\n=== ${file} ===`);
    console.log(`Tote Klassen: ${deadClassSet.size}`);
    console.log(`Komplett tote Regeln: ${deadRules.length}`);
    console.log(`Regeln mit teilweise toten Selektoren: ${partialRules.length}`);
    for (const e of deadRules) {
      console.log(`  [rule  L${e.line}] ${e.selectors.join(", ").replace(/\s+/g, " ")}`);
    }
    for (const e of partialRules) {
      console.log(`  [part  L${e.line}] -${e.dead.map((d) => d.sel.replace(/\s+/g, " ")).join(" | -")}`);
    }
    console.log(`Tote Klassen: ${[...deadClassSet].sort().join(" ")}`);

    if (opts.mode === "write") {
      let removedSelectors = 0;
      for (const e of partialRules) {
        const deadSet = new Set(e.dead.map((d) => d.sel));
        e.rule.selectors = e.selectors.filter((s) => !deadSet.has(s));
        removedSelectors += deadSet.size;
      }
      for (const e of deadRules) {
        removedSelectors += e.selectors.length;
        e.rule.remove();
      }
      const removedAt = pruneEmptyAtRules(root);
      const out = root.toString();
      postcss.parse(out, { from: file }); // Syntax-Check
      fs.writeFileSync(file, out, "utf8");
      console.log(
        `GESCHRIEBEN: ${deadRules.length} Regeln, ${removedSelectors} Selektoren, ${removedAt} leere At-Rules entfernt. ` +
          `${css.split("\n").length} -> ${out.split("\n").length} Zeilen, ${css.length} -> ${out.length} Zeichen`,
      );
    }
  }
}

if (path.basename(process.argv[1] ?? "") === "find-dead-css.mjs") {
  main();
}
