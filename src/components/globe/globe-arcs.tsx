"use client";

import { useEffect, useRef, useState } from "react";
import type { LineString } from "geojson";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { HOME_BASE } from "@/content/pgtVenueCoordinates";
import type { EventStatus } from "@/lib/season-status";

export type GlobeItem = {
  id: string;
  name: string;
  dates: string;
  place: string;
  country: string;
  lat: number;
  lon: number;
  status: EventStatus;
};

/** Fokus-Auftrag von außen. `n` erzwingt auch bei gleichem Index eine neue Drehung. */
export type GlobeFocus = { index: number; n: number };

const COLORS = {
  oceanCenter: "#2a2823",
  oceanEdge: "#0b0b0b",
  land: "#3d3a33",
  coast: "rgba(250, 249, 246, 0.22)",
  grid: "rgba(250, 249, 246, 0.06)",
  dot: "#faf9f6",
  home: "#ff4d52",
  returnLeg: "rgba(250, 249, 246, 0.35)",
};

const ARC_COLOR: Record<EventStatus, string> = {
  past: "rgba(250, 249, 246, 0.3)",
  upcoming: "rgba(255, 77, 82, 0.55)",
  next: "#ff4d52",
  live: "#f5c451",
};

const INTRO_MS = 4200;
const TWEEN_MS = 1000;
const ROTATE_DEG_PER_S = 6;
const HIT_RADIUS_PX = 14;
const START_CENTER = { lon: 12, lat: 38 };

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

export function GlobeArcs({
  items,
  focus,
  onSelect,
}: {
  items: GlobeItem[];
  focus: GlobeFocus | null;
  onSelect?: (index: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  const focusRef = useRef<((idx: number) => void) | null>(null);
  const landRef = useRef<ReturnType<typeof feature> | null>(null);
  const rotRef = useRef<[number, number]>([-START_CENTER.lon, -START_CENTER.lat]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const dirtyRef = useRef(true);
  const introRef = useRef(0);
  const dragRef = useRef<{ x: number; y: number; rot: [number, number]; moved: boolean } | null>(null);
  const tweenRef = useRef<{ from: [number, number]; to: [number, number]; start: number } | null>(null);
  const reducedRef = useRef(false);
  const hoverRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    itemsRef.current = items;
    dirtyRef.current = true;
  }, [items]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const projection = geoOrthographic().clipAngle(90).precision(0.5);
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) introRef.current = INTRO_MS;

    let frame = 0;
    let last = performance.now();
    let running = false;

    fetch("/geo/land-110m.json")
      .then((res) => res.json())
      .then((topo: Topology) => {
        landRef.current = feature(topo, topo.objects.land);
        dirtyRef.current = true;
        setReady(true);
      })
      .catch(() => setReady(false));

    const resize = () => {
      const w = wrap.clientWidth;
      const h = Math.min(w, 560);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      projection.translate([w / 2, h / 2]).scale(Math.min(w, h) / 2 - 12);
      dirtyRef.current = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const home: [number, number] = [HOME_BASE.lon, HOME_BASE.lat];
    const centerOf = (): [number, number] => [-rotRef.current[0], -rotRef.current[1]];

    const draw = () => {
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const path = geoPath(projection, ctx);
      const r = projection.scale();

      const gradient = ctx.createRadialGradient(w / 2 - r * 0.35, h / 2 - r * 0.4, r * 0.1, w / 2, h / 2, r);
      gradient.addColorStop(0, COLORS.oceanCenter);
      gradient.addColorStop(1, COLORS.oceanEdge);
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(250, 249, 246, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      path(geoGraticule10());
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      if (landRef.current) {
        ctx.beginPath();
        path(landRef.current);
        ctx.fillStyle = COLORS.land;
        ctx.fill();
        ctx.strokeStyle = COLORS.coast;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Etappen: Wattwil -> Turnier 1 -> Turnier 2 -> ... -> Rückreise nach Wattwil.
      const list = itemsRef.current;
      const n = list.length;
      const legCount = n + 1;
      const intro = Math.min(introRef.current / INTRO_MS, 1);
      const active = hoverRef.current ?? selectedRef.current;

      const drawLeg = (
        from: [number, number],
        to: [number, number],
        slot: number,
        style: { color: string; width: number; dash?: number[]; glow?: boolean },
      ) => {
        const start = (slot / legCount) * 0.85;
        const f = Math.min(Math.max((intro - start) / 0.15, 0), 1);
        if (f <= 0) return;
        const interp = geoInterpolate(from, to);
        const steps = Math.max(2, Math.round(f * 60));
        const line: LineString = {
          type: "LineString",
          coordinates: Array.from({ length: steps + 1 }, (_, k) => interp((k / steps) * f)),
        };
        ctx.beginPath();
        path(line);
        ctx.setLineDash(style.dash ?? []);
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;
        ctx.shadowColor = style.glow ? "rgba(255, 77, 82, 0.8)" : "transparent";
        ctx.shadowBlur = style.glow ? 10 : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
      };

      list.forEach((it, i) => {
        const from: [number, number] = i === 0 ? home : [list[i - 1].lon, list[i - 1].lat];
        const isActive = i === active;
        drawLeg(from, [it.lon, it.lat], i, {
          color: isActive ? COLORS.home : ARC_COLOR[it.status],
          width: isActive ? 2.6 : it.status === "past" ? 1 : 1.6,
          glow: isActive || it.status === "live",
        });
      });

      if (n > 0) {
        const last = list[n - 1];
        drawLeg([last.lon, last.lat], home, n, {
          color: COLORS.returnLeg,
          width: 1,
          dash: [4, 5],
        });
      }

      const center = centerOf();
      list.forEach((it, i) => {
        if (geoDistance([it.lon, it.lat], center) >= Math.PI / 2) return;
        const p = projection([it.lon, it.lat]);
        if (!p) return;
        const isActive = i === active;
        ctx.beginPath();
        ctx.arc(p[0], p[1], isActive ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.dot;
        ctx.fill();
      });

      if (geoDistance(home, center) < Math.PI / 2) {
        const p = projection(home);
        if (p) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.home;
          ctx.fill();
          ctx.font = "600 12px system-ui, sans-serif";
          ctx.fillStyle = COLORS.dot;
          ctx.fillText(HOME_BASE.name, p[0] + 8, p[1] + 4);
        }
      }
    };

    const frameFn = (now: number) => {
      if (!running) return;
      const dt = now - last;
      last = now;

      if (introRef.current < INTRO_MS) {
        introRef.current = Math.min(INTRO_MS, introRef.current + dt);
        dirtyRef.current = true;
      }

      const tw = tweenRef.current;
      if (tw) {
        const k = Math.min((now - tw.start) / TWEEN_MS, 1);
        const e = easeOutCubic(k);
        rotRef.current = [tw.from[0] + (tw.to[0] - tw.from[0]) * e, tw.from[1] + (tw.to[1] - tw.from[1]) * e];
        if (k >= 1) tweenRef.current = null;
        dirtyRef.current = true;
      } else if (!dragRef.current && hoverRef.current === null && !reducedRef.current) {
        rotRef.current = [rotRef.current[0] + (ROTATE_DEG_PER_S * dt) / 1000, rotRef.current[1]];
        dirtyRef.current = true;
      }

      if (dirtyRef.current) {
        draw();
        dirtyRef.current = false;
      }
      frame = requestAnimationFrame(frameFn);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(frameFn);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0.05,
    });
    io.observe(canvas);

    const hitTest = (x: number, y: number): number | null => {
      const center = centerOf();
      let best: number | null = null;
      let bestDist = HIT_RADIUS_PX;
      itemsRef.current.forEach((it, i) => {
        if (geoDistance([it.lon, it.lat], center) >= Math.PI / 2) return;
        const p = projection([it.lon, it.lat]);
        if (!p) return;
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    };

    const focusItem = (idx: number) => {
      const it = itemsRef.current[idx];
      if (!it) return;
      const from = [...rotRef.current] as [number, number];
      const delta = ((-it.lon - from[0] + 540) % 360) - 180;
      tweenRef.current = {
        from,
        to: [from[0] + delta, Math.max(-70, Math.min(70, -it.lat))],
        start: performance.now(),
      };
      selectedRef.current = idx;
      dirtyRef.current = true;
    };
    focusRef.current = focusItem;

    const localPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      tweenRef.current = null;
      dragRef.current = { x: e.clientX, y: e.clientY, rot: [...rotRef.current] as [number, number], moved: false };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (drag) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        const k = 0.4;
        rotRef.current = [drag.rot[0] + dx * k, Math.max(-70, Math.min(70, drag.rot[1] - dy * k))];
        dirtyRef.current = true;
        return;
      }
      const p = localPos(e);
      const idx = hitTest(p.x, p.y);
      if (idx !== hoverRef.current) {
        hoverRef.current = idx;
        dirtyRef.current = true;
        setHovered(idx);
      }
      setTip(idx === null ? null : p);
    };

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      canvas.releasePointerCapture(e.pointerId);
      if (drag && !drag.moved && hoverRef.current !== null) {
        focusItem(hoverRef.current);
        onSelectRef.current?.(hoverRef.current);
      }
    };

    const onLeave = () => {
      if (dragRef.current) return;
      hoverRef.current = null;
      dirtyRef.current = true;
      setHovered(null);
      setTip(null);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      focusRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (focus) focusRef.current?.(focus.index);
  }, [focus]);

  const hoveredItem = hovered !== null ? items[hovered] : null;

  return (
    <div className="globe" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="globe__canvas"
        role="img"
        aria-label={`Globus mit ${items.length} Turnieren. Die Linie verbindet die Turniere in Reihenfolge, Start und Ende sind ${HOME_BASE.name}. Turniere in der Kalenderliste anklicken, um sie anzuzeigen.`}
      />
      {hoveredItem && tip ? (
        <div className="globe__tip" style={{ left: tip.x, top: tip.y }}>
          <strong>{hoveredItem.name}</strong>
          <span>{hoveredItem.dates}</span>
          <span>{hoveredItem.place}</span>
        </div>
      ) : null}
      {!ready ? <p className="globe__loading">Karte wird geladen …</p> : null}
    </div>
  );
}
