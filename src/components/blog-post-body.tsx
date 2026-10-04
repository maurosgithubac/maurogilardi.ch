import Image from "next/image";
import { blogHeadingId, parseBlogTextBlocks } from "@/lib/blog/parse-blog-blocks";
import { VerticalVideo } from "@/components/video/vertical-video";
import { videosById } from "@/content/campaign-video";

type Segment =
  | { type: "text"; content: string }
  | { type: "image"; src: string; alt: string }
  | { type: "video"; id: string; caption: string };

/** Inline-Medien im Fliesstext: {{IMAGE:/pfad|Alt-Text}} und {{VIDEO:id|Bildunterschrift}} */
const MEDIA_MARKER = /\{\{(IMAGE|VIDEO):([^|}]+)\|([^}]*)\}\}/g;

const INLINE_BOLD = /\*\*([^*]+)\*\*/g;

export function parseBlogBody(body: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MEDIA_MARKER.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: body.slice(lastIndex, match.index) });
    }
    if (match[1] === "VIDEO") {
      segments.push({ type: "video", id: match[2].trim(), caption: match[3].trim() });
    } else {
      segments.push({ type: "image", src: match[2].trim(), alt: match[3].trim() });
    }
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
            <Tag key={`h-${index}`} id={blogHeadingId(block.text)} className="blog-post-subheading">
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
        if (seg.type === "video") {
          const video = videosById[seg.id];
          if (!video) return null;
          return (
            <figure key={`v-${i}`} className="blog-post-inline-video">
              <VerticalVideo video={video} trackLabel={`blog_${seg.id}`} />
              {seg.caption ? <figcaption>{seg.caption}</figcaption> : null}
            </figure>
          );
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
