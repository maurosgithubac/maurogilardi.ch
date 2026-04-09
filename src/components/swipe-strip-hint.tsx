/** Sichtbarer Hinweis für horizontal wischbare Bereiche (nur anzeigen, wenn Eltern per CSS einblendet). */
export function SwipeStripHint() {
  return (
    <p className="swipe-strip-hint">
      <span className="swipe-strip-hint-chevron swipe-strip-hint-chevron--left" aria-hidden>
        ‹
      </span>
      <span>Zum Blättern wischen</span>
      <span className="swipe-strip-hint-chevron swipe-strip-hint-chevron--right" aria-hidden>
        ›
      </span>
    </p>
  );
}
