/** Rechtstexte — Impressum & Datenschutz (Schweiz, de-CH) */

import { siteContent } from "@/content/siteContent";

export const legalPublisher = {
  name: "Mauro Gilardi",
  role: "Swiss PGA Professional",
  siteName: "maurogilardi.ch",
  siteUrl: "https://www.maurogilardi.ch",
  email: siteContent.contact.email,
  region: "Graubünden",
  country: "Schweiz",
  hosting: "Vercel Inc.",
  hostingUrl: "https://vercel.com",
} as const;

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const impressumSections: LegalSection[] = [
  {
    id: "verantwortlich",
    title: "Verantwortlich für den Inhalt",
    paragraphs: [
      `${legalPublisher.name} — ${legalPublisher.role}`,
      `${legalPublisher.region}, ${legalPublisher.country}`,
      `E-Mail: ${legalPublisher.email}`,
      `Website: ${legalPublisher.siteUrl}`,
    ],
  },
  {
    id: "zweck",
    title: "Zweck der Website",
    paragraphs: [
      "Diese Website informiert über Mauro Gilardi als Schweizer Golf Professional: Tour-Updates, Blog, Erfolge, Sponsoring und Kontaktmöglichkeiten.",
    ],
  },
  {
    id: "haftung",
    title: "Haftungsausschluss",
    paragraphs: [
      "Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.",
      "Verweise auf externe Websites liegen ausserhalb des Verantwortungsbereichs. Für deren Inhalte sind ausschliesslich deren Betreiber verantwortlich.",
    ],
  },
  {
    id: "urheber",
    title: "Urheberrecht",
    paragraphs: [
      "Texte, Bilder, Grafiken und Logos auf dieser Website sind urheberrechtlich geschützt, sofern nicht anders gekennzeichnet. Eine Verwendung ohne vorherige schriftliche Zustimmung ist nicht gestattet.",
    ],
  },
  {
    id: "hosting",
    title: "Hosting",
    paragraphs: [
      `Die Website wird bei ${legalPublisher.hosting} gehostet.`,
      `Weitere Informationen: ${legalPublisher.hostingUrl}`,
    ],
  },
];

export const datenschutzSections: LegalSection[] = [
  {
    id: "ueberblick",
    title: "Überblick",
    paragraphs: [
      "Der Schutz deiner Daten ist mir wichtig. Diese Datenschutzerklärung erläutert, welche personenbezogenen Daten auf maurogilardi.ch verarbeitet werden und zu welchem Zweck — gemäss dem schweizerischen Datenschutzgesetz (DSG) und der Datenschutz-Grundverordnung (DSGVO), soweit anwendbar.",
    ],
  },
  {
    id: "verantwortlich",
    title: "Verantwortliche Stelle",
    paragraphs: [
      `${legalPublisher.name}`,
      `${legalPublisher.region}, ${legalPublisher.country}`,
      `Kontakt: ${legalPublisher.email}`,
    ],
  },
  {
    id: "zugriff",
    title: "Beim Besuch der Website",
    paragraphs: [
      "Beim Aufruf der Website werden technisch notwendige Daten verarbeitet (z. B. IP-Adresse, Datum/Uhrzeit, aufgerufene Seite, Browser-Typ), um die Website auszuliefern und die Sicherheit zu gewährleisten.",
      `Hosting-Anbieter: ${legalPublisher.hosting}. Dabei können Server-Logfiles in den USA oder anderen Ländern anfallen.`,
    ],
  },
  {
    id: "formulare",
    title: "Newsletter & Kontaktformulare",
    paragraphs: [
      "Wenn du dich für den Newsletter anmeldest oder das Sponsoring-/Gönner-Formular nutzt, verarbeite ich die von dir angegebenen Daten (z. B. Name, E-Mail, Nachricht) zur Bearbeitung deiner Anfrage.",
      "Die Newsletter-Anmeldung kann über einen externen Dienstleister (z. B. Beehiiv) erfolgen. Gönner-Anfragen werden in einer Datenbank (Supabase) gespeichert und per E-Mail-Dienst (z. B. Resend) bearbeitet.",
    ],
    bullets: [
      "Zweck: Versand von Updates bzw. Beantwortung deiner Anfrage",
      "Rechtsgrundlage: Einwilligung bzw. berechtigtes Interesse an der Kommunikation",
      "Speicherdauer: solange für den Zweck erforderlich oder bis zum Widerruf",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & lokale Speicherung",
    paragraphs: [
      "Diese Website setzt primär technisch notwendige Cookies ein (z. B. für den Admin-Bereich oder Session-Verwaltung).",
      "Deine Cookie-Einstellung wird lokal im Browser gespeichert (localStorage), damit der Hinweis nicht bei jedem Besuch erneut erscheint.",
      "Es werden keine Marketing- oder Tracking-Cookies von Drittanbietern (z. B. Google Analytics) ohne deine Einwilligung eingesetzt.",
    ],
    bullets: [
      "mg-cookie-consent — Speichert deine Cookie-Auswahl (lokal, kein Tracking)",
      "Supabase-Auth-Cookies — nur im geschützten Admin-Bereich",
    ],
  },
  {
    id: "rechte",
    title: "Deine Rechte",
    paragraphs: [
      "Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner Daten sowie auf Widerspruch und Datenübertragbarkeit, soweit gesetzlich vorgesehen.",
      `Wende dich dazu an: ${legalPublisher.email}`,
      "Du kannst dich zudem bei der zuständigen Datenschutz-Aufsichtsbehörde beschweren.",
    ],
  },
  {
    id: "aenderungen",
    title: "Änderungen",
    paragraphs: [
      "Diese Datenschutzerklärung kann bei Bedarf angepasst werden. Es gilt die jeweils auf dieser Seite veröffentlichte Version.",
      `Stand: ${new Date().getFullYear()}`,
    ],
  },
];
