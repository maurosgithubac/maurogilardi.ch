import Image from "next/image";

type Segment =
  | { type: "text"; content: string }
  | { type: "image"; src: string; alt: string };

/** Inline-Bilder im Fliesstext: {{IMAGE:/pfad|Alt-Text}} */
const IMAGE_MARKER = /\{\{IMAGE:([^|]+)\|([^}]+)\}\}/g;

export function parseBlogBody(body: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = IMAGE_MARKER.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: body.slice(lastIndex, match.index) });
    }
    segments.push({ type: "image", src: match[1].trim(), alt: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", content: body.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", content: body }];
}

export function BlogPostBody({ body }: { body: string }) {
  const segments = parseBlogBody(body);

  return (
    <div className="blog-post-body">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return (
            <span key={`t-${i}`} className="blog-post-body-block">
              {seg.content}
            </span>
          );
        }
        return (
          <figure key={`i-${i}`} className="blog-post-inline-figure">
            <div className="blog-post-inline-figure-aspect">
              <Image
                src={seg.src}
                alt={seg.alt}
                fill
                sizes="(max-width: 720px) 100vw, min(var(--page-content-max), 720px)"
                className="blog-post-inline-figure-img"
              />
            </div>
            {seg.alt ? <figcaption className="blog-post-inline-figure-caption">{seg.alt}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}
