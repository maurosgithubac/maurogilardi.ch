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
    <div className="site-page legal-page">
      <SiteHeader variant="document" />
      <main className="legal-page-main">
        <article className="legal-page-inner">
          <header className="legal-page-head">
            <h1>{title}</h1>
            {lead ? <p className="legal-page-lead">{lead}</p> : null}
          </header>
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
