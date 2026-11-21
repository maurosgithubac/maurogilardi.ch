import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  /** Kleine Zeile über dem Titel (Bereich) */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Buttons rechts (ap-btn ...) */
  actions?: ReactNode;
  /** Zurück-Link über dem Titel, z. B. { href: "/admin", label: "Dashboard" } */
  back?: { href: string; label: string };
  /** Zusatzinhalt unter der Beschreibung (z. B. Tabs, Kennzahlen) */
  children?: ReactNode;
  className?: string;
};

/**
 * Einheitlicher Seitenkopf für alle Admin-Seiten.
 * Nutzt .ap-page-head, .ap-eyebrow, .ap-h1, .ap-page-desc und .ap-page-actions (Styles in admin-system.css).
 */
export function AdminPageHeader({ title, eyebrow, description, actions, back, children, className }: Props) {
  return (
    <header className={`ap-page-head${className ? ` ${className}` : ""}`}>
      <div className="ap-page-head-text">
        {back ? (
          <Link href={back.href} className="ap-back">
            <span aria-hidden="true">‹</span> {back.label}
          </Link>
        ) : null}
        {eyebrow ? <p className="ap-eyebrow">{eyebrow}</p> : null}
        <h1 className="ap-h1">{title}</h1>
        {description ? <p className="ap-page-desc">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="ap-page-actions">{actions}</div> : null}
    </header>
  );
}
