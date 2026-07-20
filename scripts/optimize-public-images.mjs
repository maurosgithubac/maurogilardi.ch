/**
 * Phase-2 image source optimization:
 * - Cap longest edge at 1920px (no upscaling)
 * - Re-encode JPEG/WebP at quality 82 (visually near-lossless for web)
 * - Keep original paths/filenames so app code stays unchanged
 *
 * Usage: node scripts/optimize-public-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const MAX_EDGE = 1920;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
const ROOTS = [
  path.join("public", "brand-assets", "gallerie"),
  path.join("public", "brand-assets", "images"),
];
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXTS.has(path.extname(name))) files.push(full);
  }
  return files;
}

async function optimizeFile(filePath) {
  const beforeBytes = fs.statSync(filePath).size;
  const input = sharp(filePath, { failOn: "none", animated: false });
  const meta = await input.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  if (!width || !height) {
    return { filePath, skipped: true, reason: "no-dimensions" };
  }

  const needsResize = width > MAX_EDGE || height > MAX_EDGE;
  // Recompress very heavy files even if already within edge limit
  const needsRecompress = beforeBytes > 900 * 1024;
  if (!needsResize && !needsRecompress) {
    return { filePath, skipped: true, reason: "already-ok", width, height, beforeBytes };
  }

  let pipeline = sharp(filePath, { failOn: "none", animated: false }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const format = (meta.format || path.extname(filePath).slice(1).toLowerCase()).toLowerCase();
  const tmpPath = `${filePath}.__opt.tmp`;

  if (format === "png") {
    await pipeline.png({ compressionLevel: 9, palette: false }).toFile(tmpPath);
  } else if (format === "webp") {
    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(tmpPath);
  } else {
    // jpeg / jpg / unknown raster → jpeg
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toFile(tmpPath);
  }

  const afterBytes = fs.statSync(tmpPath).size;
  if (afterBytes >= beforeBytes) {
    fs.unlinkSync(tmpPath);
    return { filePath, skipped: true, reason: "no-savings", width, height, beforeBytes };
  }

  // Keep original filename/extension; content is re-encoded in place.
  fs.renameSync(tmpPath, filePath);
  const afterMeta = await sharp(filePath, { failOn: "none" }).metadata();

  return {
    filePath,
    skipped: false,
    widthBefore: width,
    heightBefore: height,
    widthAfter: afterMeta.width,
    heightAfter: afterMeta.height,
    beforeBytes,
    afterBytes,
    savedBytes: beforeBytes - afterBytes,
  };
}

const files = ROOTS.flatMap((root) => walk(root));
const results = [];
let saved = 0;
let changed = 0;

console.log(`Optimizing ${files.length} images (max edge ${MAX_EDGE}px)…`);

for (const file of files) {
  try {
    const result = await optimizeFile(file);
    results.push(result);
    if (!result.skipped) {
      changed += 1;
      saved += result.savedBytes || 0;
      const mbBefore = (result.beforeBytes / (1024 * 1024)).toFixed(2);
      const mbAfter = (result.afterBytes / (1024 * 1024)).toFixed(2);
      console.log(
        `✓ ${file}: ${result.widthBefore}x${result.heightBefore} ${mbBefore}MB → ${result.widthAfter}x${result.heightAfter} ${mbAfter}MB`,
      );
    }
  } catch (error) {
    console.error(`✗ ${file}:`, error instanceof Error ? error.message : error);
  }
}

console.log("---");
console.log(`Changed: ${changed}/${files.length}`);
console.log(`Saved: ${(saved / (1024 * 1024)).toFixed(1)} MB`);
