/** Skeleton während Seiten laden. Nutzt dieselben Karten wie die Seiten, damit nichts springt. */
export default function AdminLoading() {
  return (
    <div className="ap-page ap-skel-page" aria-busy="true" aria-live="polite">
      <span className="sr-only">Lädt …</span>
      <div className="ap-page-head">
        <div className="ap-page-head-text">
          <span className="ap-skel" style={{ width: 90, height: 12 }} />
          <span className="ap-skel" style={{ width: "min(320px, 70%)", height: 44 }} />
          <span className="ap-skel" style={{ width: "min(420px, 90%)", height: 14 }} />
        </div>
      </div>
      <div className="ap-skel-grid">
        <div className="ap-card ap-skel-card ap-skel-card--wide" style={{ ["--i" as string]: 0 }}>
          <span className="ap-skel" style={{ width: 160, height: 14 }} />
          <span className="ap-skel" style={{ width: "100%", height: 180 }} />
        </div>
        <div className="ap-card ap-skel-card" style={{ ["--i" as string]: 1 }}>
          <span className="ap-skel" style={{ width: 110, height: 14 }} />
          <span className="ap-skel" style={{ width: "100%", height: 52 }} />
          <span className="ap-skel" style={{ width: "100%", height: 52 }} />
        </div>
        <div className="ap-card ap-skel-card" style={{ ["--i" as string]: 2 }}>
          <span className="ap-skel" style={{ width: 120, height: 14 }} />
          <span className="ap-skel" style={{ width: "70%", height: 40 }} />
          <span className="ap-skel" style={{ width: "50%", height: 12 }} />
        </div>
        <div className="ap-card ap-skel-card" style={{ ["--i" as string]: 3 }}>
          <span className="ap-skel" style={{ width: 120, height: 14 }} />
          <span className="ap-skel" style={{ width: "70%", height: 40 }} />
          <span className="ap-skel" style={{ width: "50%", height: 12 }} />
        </div>
        <div className="ap-card ap-skel-card" style={{ ["--i" as string]: 4 }}>
          <span className="ap-skel" style={{ width: 120, height: 14 }} />
          <span className="ap-skel" style={{ width: "70%", height: 40 }} />
          <span className="ap-skel" style={{ width: "50%", height: 12 }} />
        </div>
      </div>
    </div>
  );
}
