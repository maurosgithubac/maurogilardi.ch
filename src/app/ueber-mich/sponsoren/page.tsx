import Image from "next/image";
import Link from "next/link";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { sponsorLogoUrl } from "@/lib/storage-public-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { SponsorRow } from "@/types/content";

export const metadata = {
  title: "Sponsoren & Partner | Mauro Gilardi",
  description: "Partner und Sponsoren, die meinen Weg im Profigolf unterstützen.",
};

export const revalidate = 3600;

export default async function UeberMichSponsorenPage() {
  type SponsorCard = Pick<SponsorRow, "id" | "name" | "logo_path" | "website_url">;
  let sponsors: SponsorCard[] = [];

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("sponsors")
      .select("id, name, logo_path, website_url")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    sponsors = data ?? [];
  } catch {
    /* Supabase nicht konfiguriert */
  }

  return (
    <AboutSubpageShell
      label="Über mich"
      title="Sponsoren & Partner"
      lead="Ohne die richtigen Partner gäbe es keinen professionellen Auftritt auf und neben dem Platz — vielen Dank für das Vertrauen."
      heroSrc="/brand-assets/images/1L9A9440.JPG"
      heroAlt="Mauro Gilardi im Turnier"
    >
      <section className="about-sponsors-page" aria-label="Partnerlogos">
        <div className="about-sponsors-page-inner">
          {sponsors.length === 0 ? (
            <div className="about-sponsors-empty">
              <p>
                Die Partnerliste wird aktuell gepflegt. Auf der Startseite siehst du laufend aktuelle Logos — oder
                schreib mir für eine Zusammenarbeit.
              </p>
              <div className="about-sponsors-empty-actions">
                <Link href="/" className="about-btn about-btn-primary">
                  Zur Startseite
                </Link>
                <Link href="/goenner" className="about-btn about-btn-ghost">
                  Gönner werden
                </Link>
              </div>
            </div>
          ) : (
            <ul className="about-sponsors-page-grid">
              {sponsors.map((s) => {
                const logo = sponsorLogoUrl(s.logo_path);
                const inner = (
                  <>
                    <div className="about-sponsors-page-logo">
                      {logo ? (
                        <Image src={logo} alt="" width={200} height={80} className="about-sponsors-page-logo-img" />
                      ) : (
                        <span className="about-sponsors-page-fallback">{s.name}</span>
                      )}
                    </div>
                    <span className="about-sponsors-page-name">{s.name}</span>
                  </>
                );
                return (
                  <li key={s.id}>
                    {s.website_url ? (
                      <a
                        href={s.website_url}
                        className="about-sponsors-page-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="about-sponsors-page-card about-sponsors-page-card--static">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <aside className="about-sponsors-aside">
            <h2 className="about-sponsors-aside-title">Partnerschaft</h2>
            <p className="about-sponsors-aside-text">
              Interesse an sichtbarer Zusammenarbeit, Events oder langfristiger Unterstützung? Ich freue mich auf ein
              Gespräch — unverbindlich und klar in den Erwartungen.
            </p>
            <Link href="/goenner" className="about-btn about-btn-primary">
              Gönner &amp; Mitgliedschaften
            </Link>
          </aside>
        </div>
      </section>
    </AboutSubpageShell>
  );
}
