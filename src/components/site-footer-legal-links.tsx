import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

export function SiteFooterLegalLinks() {
  return (
    <>
      <Link href="/impressum">Impressum</Link>
      <Link href="/datenschutz">Datenschutz</Link>
      <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link>
      <Link href="/goenner-bedingungen">Gönner-Bedingungen</Link>
      <CookieSettingsButton />
    </>
  );
}
