import Image from "next/image";
import Link from "next/link";
import { TiltCard } from "@/components/motion/tilt-card";

const dateFmt = new Intl.DateTimeFormat("de-CH", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

type Props = {
  slug: string;
  title: string;
  description?: string | null;
  createdAt: string;
  imageUrl: string | null;
  headingLevel?: "h2" | "h3";
  /** Grosse Variante (erster Beitrag im Blog) */
  feature?: boolean;
  priority?: boolean;
};

/** Blog-Karte mit Bildzoom und leichter 3D-Neigung beim Hover */
export function PostCard({ slug, title, description, createdAt, imageUrl, headingLevel = "h3", feature = false, priority = false }: Props) {
  const Heading = headingLevel;
  return (
    <TiltCard className={`mg-post${feature ? " mg-post--feature" : ""}`} max={3}>
      <Link href={`/blog/${slug}`} className="mg-post__link">
        <div className="mg-post__media">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              priority={priority}
              sizes={feature ? "(max-width: 960px) 100vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"}
              className="mg-cover mg-post__img"
            />
          ) : (
            <div className="mg-post__placeholder" />
          )}
        </div>
        <div className="mg-post__body">
          <time dateTime={createdAt} className="mg-post__date">
            {dateFmt.format(new Date(createdAt))}
          </time>
          <Heading className="mg-post__title">{title}</Heading>
          {description ? <p className="mg-post__desc">{description}</p> : null}
          <span className="mg-post__more">
            Weiterlesen <span className="mg-btn__arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
