import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Props = {
  title: string;
  lead?: string;
  children: ReactNode;
};

export function LegalPageShell({ title, lead, children }: Props) {
  return (
    <div className="mg-page site-page legal-page">
      <SiteHeader variant="document" />
      <main id="inhalt" className="mg-legal">
        <article className="mg-legal__inner mg-container">
          <header className="mg-legal__head">
            <p className="mg-eyebrow">Rechtliches</p>
            <h1 className="mg-h2">{title}</h1>
            {lead ? <p className="mg-lead">{lead}</p> : null}
          </header>
          <div className="mg-legal__body">{children}</div>
        </article>
      </main>
      <SiteFooter showContactForm={false} />
    </div>
  );
}
