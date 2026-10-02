"use client";

import { useState } from "react";
import { GalleryGrid } from "@/components/gallery-grid";
import type { GoennerturnierPhoto } from "@/content/goennerturnier-photos";

const PREVIEW = 24;

/** Gönnerturnier-Fotos aller Jahre gemischt, kleine Kacheln, Lightbox. Wasserzeichen sind im Bild. */
export function GoennerturnierGallery({ photos, photographers }: { photos: GoennerturnierPhoto[]; photographers: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? photos : photos.slice(0, PREVIEW);

  return (
    <div className="mg-turnier">
      <GalleryGrid
        dense
        items={visible.map((p) => ({
          src: p.src,
          alt: `Gönnerturnier ${p.year}, Foto ${p.photographer}`,
        }))}
      />
      <div className="mg-turnier__bar">
        <p className="mg-turnier__credit">
          Fotos: <span>{photographers.join(" · ")}</span>
        </p>
        {photos.length > PREVIEW ? (
          <button type="button" className="mg-btn mg-btn--ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Weniger anzeigen" : `Alle ${photos.length} Fotos`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
