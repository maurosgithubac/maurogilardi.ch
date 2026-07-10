import Image from "next/image";
import { parseBlogTextBlocks } from "@/lib/blog/parse-blog-blocks";

type Segment =
  | { type: "text"; content: string }
  | { type: "image"; src: string; alt: string };

/** Inline-Bilder im Fliesstext: {{IMAGE:/pfad|Alt-Text}} */
const IMAGE_MARKER = /\{\{IMAGE:([^|]+)\|([^}]+)\}\}/g;

const INLINE_BOLD = /\*\*([^*]+)\*\*/g;

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

function renderInlineText(text: string, keyPrefix: string) {
  const parts = text.split(INLINE_BOLD);
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={`${keyPrefix}-b-${index}`} className="blog-post-body-strong">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function BlogTextContent({ content }: { content: string }) {
  const blocks = parseBlogTextBlocks(content);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag key={`h-${index}`} className="blog-post-subheading">
              {block.text}
            </Tag>
          );
        }

        return (
          <p key={`p-${index}`} className="blog-post-paragraph">
            {renderInlineText(block.text, `p-${index}`)}
          </p>
        );
      })}
    </>
  );
}

export function BlogPostBody({ body }: { body: string }) {
  const segments = parseBlogBody(body);

  return (
    <div className="blog-post-body">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <BlogTextContent key={`t-${i}`} content={seg.content} />;
        }
        return (
          <figure key={`i-${i}`} className="blog-post-inline-figure">
            <div className="blog-post-inline-figure-aspect">
              <Image
                src={seg.src}
                alt={seg.alt}
                fill
                sizes="(max-width: 904px) calc(100vw - 2rem), 56rem"
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
