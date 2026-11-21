"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { KalenderEvent, KalenderTotals } from "@/components/kalender/kalender-view";
import { HOME_BASE } from "@/content/pgtVenueCoordinates";

type Stop = { lon: number; lat: number; name: string; place: string; dates: string; kind: "home" | "turnier" | "camp"; legKm: number | null };

const C = {
  bg: "#0b0b0b",
  ocean: "#15140f",
  land: "#3d3a33",
  grid: "rgba(250,249,246,0.07)",
  red: "#d71920",
  redSoft: "rgba(215,25,32,0.35)",
  paper: "#faf9f6",
  muted: "rgba(250,249,246,0.55)",
  future: "rgba(250,249,246,0.22)",
};

const SAMPLES = 90;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Ein Stopp pro Ort: Wattwil, jedes Turnier, zurÃ¼ck nach Wattwil. */
function buildStops(events: KalenderEvent[]): Stop[] {
  const venues = events.filter((e) => e.lat != null && e.lon != null);
  const home: Stop = { lon: HOME_BASE.lon, lat: HOME_BASE.lat, name: HOME_BASE.name, place: HOME_BASE.name, dates: "", kind: "home", legKm: null };
  const stops: Stop[] = venues.map((e) => ({
    lon: e.lon as number,
    lat: e.lat as number,
    name: e.name,
    place: e.place,
    dates: e.dates,
    kind: e.kind === "camp" ? "camp" : "turnier",
    legKm: e.legKm,
  }));
  return [home, ...stops, { ...home, legKm: null }];
}

export function KalenderJourney({ events, totals, homeName }: { events: KalenderEvent[]; totals: KalenderTotals; homeName: string }) {
  const stops = useMemo(() => buildStops(events), [events]);
  const legs = Math.max(stops.length - 1, 1);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landRef = useRef<unknown>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const [active, setActive] = useState(0);
  const [reached, setReached] = useState(0);
  const lastStepRef = useRef(-1);

  // Land einmal laden
  useEffect(() => {
    let cancelled = false;
    fetch("/geo/land-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        if (!cancelled) landRef.current = feature(topo, topo.objects.land);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const projection = geoOrthographic().clipAngle(90).precision(0.4);
    const path = geoPath(projection, ctx);

    let baseScale = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      baseScale = Math.min(rect.width, rect.height) / 2 - 18;
      projection.translate([rect.width / 2, rect.height / 2]).scale(baseScale);
      draw(progress());
    };

    const progress = () => {
      const max = section.offsetHeight - window.innerHeight;
      if (max <= 0) return 0;
      const p = Math.min(Math.max(-section.getBoundingClientRect().top / max, 0), 1);
      return p * legs;
    };

    const draw = (x: number) => {
      const { w, h, dpr } = sizeRef.current;
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const k = Math.min(Math.floor(x), legs - 1);
      const t = Math.min(Math.max(x - k, 0), 1);
      const from = [stops[k].lon, stops[k].lat] as [number, number];
      const to = [stops[k + 1]?.lon ?? from[0], stops[k + 1]?.lat ?? from[1]] as [number, number];
      const interp = geoInterpolate(from, to);
      const e = easeInOut(t);
      const center = interp(e);
      projection.rotate([-center[0], -center[1]]);
      // Zoom: nah am Turnier hinein, in der Flugphase heraus
      // Zoom: Wattwil-Turnier nahe Strecken kaum heraus, lange FlÃ¼ge weiter heraus. Weich Ã¼ber die ganze Etappe.
      const legKm = stops[k + 1]?.legKm ?? 0;
      // Standard ist die weite Ansicht; an den Turnieren zoomt er deutlich nÃ¤her heran.
      const farZoom = legKm > 0 ? Math.max(0.82, 1 - Math.min(0.18, legKm / 9000)) : 0.95;
      const nearZoom = 1.4;
      // Strecken auf demselben Kontinent (unter ca. 2 500 km): fester Zoom, kein Herein- und Herauszoomen.
      const sameContinent = legKm > 0 && legKm < 2500;
      const zoom = sameContinent ? 1.2 : farZoom + (nearZoom - farZoom) * (1 - Math.pow(Math.sin(Math.PI * t), 2));
      projection.scale(baseScale * zoom);
      const R = projection.scale();
      const cx = sizeRef.current.w / 2;
      const cy = sizeRef.current.h / 2;

      // AtmosphÃ¤re: weicher Lichtrand um den Globus
      const halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.22);
      halo.addColorStop(0, "rgba(250,249,246,0.16)");
      halo.addColorStop(0.45, "rgba(250,249,246,0.035)");
      halo.addColorStop(1, "rgba(215,25,32,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // Globus
      ctx.beginPath();
      path({ type: "Sphere" });
      const shade = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      shade.addColorStop(0, "#2b2922");
      shade.addColorStop(0.7, "#171510");
      shade.addColorStop(1, "#070706");
      ctx.fillStyle = shade;
      ctx.fill();
      ctx.beginPath();
      path(geoGraticule10());
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      if (landRef.current) {
        ctx.beginPath();
        path(landRef.current as never);
        ctx.fillStyle = C.land;
        ctx.fill();
        ctx.strokeStyle = "rgba(250,249,246,0.10)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Strecken: bereits gespielt (durchgezogen), aktuelle (wÃ¤chst), kommend (gestrichelt)
      for (let j = 0; j < legs; j++) {
        const a = [stops[j].lon, stops[j].lat] as [number, number];
        const b = [stops[j + 1].lon, stops[j + 1].lat] as [number, number];
        const gi = geoInterpolate(a, b);
        const pts: [number, number][] = [];
        const n = j === k ? Math.max(2, Math.round(SAMPLES * t)) : SAMPLES;
        const span = j === k ? t : j < k ? 1 : 1;
        if (j > k) {
          // kommende Strecke: nur angedeutet
          const coords = Array.from({ length: SAMPLES + 1 }, (_, i) => gi(i / SAMPLES));
          ctx.beginPath();
          path({ type: "LineString", coordinates: coords });
          ctx.setLineDash([2, 6]);
          ctx.strokeStyle = C.future;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
          continue;
        }
        for (let i = 0; i <= n; i++) pts.push(gi((i / SAMPLES) * (j === k ? SAMPLES / SAMPLES : 1) * span));
        ctx.beginPath();
        path({ type: "LineString", coordinates: pts });
        ctx.strokeStyle = j < k ? C.red : C.red;
        ctx.globalAlpha = j < k ? 0.9 : 1;
        ctx.lineWidth = j < k ? 1.4 : 2.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Stopps
      stops.forEach((s, i) => {
        const p = projection([s.lon, s.lat]);
        if (!p) return;
        const visited = i <= k || (i === k + 1 && t >= 0.98);
        ctx.beginPath();
        ctx.arc(p[0], p[1], visited ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = visited ? C.paper : C.future;
        ctx.fill();
        if (i === k + 1 && t > 0.9) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 10, 0, Math.PI * 2);
          ctx.strokeStyle = C.red;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Flugzeug-Marker auf der aktuellen Strecke
      const pos = projection(center);
      if (pos) {
        const glow = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], 16);
        glow.addColorStop(0, C.redSoft);
        glow.addColorStop(1, "rgba(215,25,32,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 4.5, 0, Math.PI * 2);
        ctx.fillStyle = C.red;
        ctx.fill();
        ctx.strokeStyle = C.paper;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Aktiver Stopp und Panel-Status
      const step = t > 0.5 ? k + 1 : k;
      if (step !== lastStepRef.current) {
        lastStepRef.current = step;
        setActive(step);
      }
      const reachedNow = t > 0.98 ? k + 1 : k;
      setReached((r) => (r === reachedNow ? r : reachedNow));
    };

    // Sanft nachgleiten statt springen: die Ansicht folgt dem Scroll mit weicher DÃ¤mpfung.
    let cur = progress();
    let target = cur;
    let frame = 0;
    const tick = () => {
      cur += (target - cur) * 0.08;
      draw(cur);
      frame = Math.abs(target - cur) > 0.0008 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      target = progress();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    resize();
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [stops, legs]);

  const current = stops[Math.min(active, stops.length - 1)];
  const ev = events.filter((e) => e.lat != null && e.lon != null)[Math.max(0, Math.min(active - 1, events.length - 1))];
  const sectionHeight = `${(legs + 1) * 100}vh`;

  if (stops.length <= 2) {
    return (
      <section className="kj kj--empty" aria-label="Reise">
        <p className="kal-empty">Noch keine Turniere mit Ort auf der Karte.</p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="kj" style={{ height: sectionHeight }} aria-label="Reise durch die Saison">
      <div className="kj__sticky">
        <aside className="kj__rail" aria-label="Stationen">
          <p className="kal-eyebrow">Die Reise</p>
          <ol className="kj__stops">
            {stops.map((s, i) => (
              <li key={i} className={`kj__stop${i === active ? " is-active" : ""}${i <= reached ? " is-done" : ""}`}>
                <span className="kj__dot" aria-hidden="true" />
                <span className="kj__stop-name">{i === 0 || i === stops.length - 1 ? homeName : s.place}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="kj__globe">
          <canvas ref={canvasRef} className="kj__canvas" role="img" aria-label={`Globus: aktuell ${current.place}`} />
        </div>

        <aside className="kj__card" aria-live="polite">
          {active === 0 || active === stops.length - 1 ? (
            <div className="kj__panel" key={`home-${active}`}>
              <p className="kal-eyebrow">{active === 0 ? "Start" : "ZurÃ¼ck zuhause"}</p>
              <h2 className="kj__title">{homeName}</h2>
              <p className="kj__meta">Gesamtstrecke: {Math.round(totals.totalKm).toLocaleString("de-CH")} km</p>
            </div>
          ) : (
            <div className="kj__panel" key={`ev-${active}`}>
              <p className="kal-eyebrow">
                {current.kind === "camp" ? "Trainingscamp" : "Turnier"} Â· {active} von {stops.length - 2}
              </p>
              <h2 className="kj__title">{current.name}</h2>
              <p className="kj__meta">{current.dates}</p>
              <p className="kj__meta">{current.place}</p>
              {current.legKm != null ? <p className="kj__leg">Etappe {Math.round(current.legKm).toLocaleString("de-CH")} km</p> : null}
              {ev?.url ? (
                <a className="kj__link" href={ev.url} target="_blank" rel="noopener noreferrer">
                  Turnierseite
                </a>
              ) : null}
            </div>
          )}
          <p className="kj__hint">Scrolle, um die Reise zu verfolgen.</p>
        </aside>
      </div>
    </section>
  );
}
