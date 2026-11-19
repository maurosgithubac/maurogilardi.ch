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
      "Wenn du dich für den Newsletter anmeldest, das Kontaktformular nutzt oder das Sponsoring-/Gönner-Formular absendest, verarbeite ich die von dir angegebenen Daten (z. B. Name, E-Mail, Nachricht) zur Bearbeitung deiner Anfrage.",
      "Die Newsletter-Anmeldung erfolgt über Beehiiv (Beehiiv Inc., USA) und zusätzlich in einer Datenbank bei Supabase (Schweiz). Kontaktnachrichten und Gönner-Anfragen werden per E-Mail über Resend (Resend Inc., USA) zugestellt; Gönner-Anfragen werden zusätzlich in Supabase gespeichert.",
    ],
    bullets: [
      "Zweck: Versand von Updates bzw. Beantwortung deiner Anfrage",
      "Rechtsgrundlage: Einwilligung bzw. berechtigtes Interesse an der Kommunikation",
      "Speicherdauer: siehe Abschnitt «Aufbewahrung»",
    ],
  },
  {
    id: "statistik",
    title: "Reichweitenmessung (Vercel Web Analytics und Google Analytics)",
    paragraphs: [
      "Um zu verstehen, welche Inhalte genutzt werden, setze ich Vercel Web Analytics ein. Es werden keine Cookies gesetzt und keine personenbezogenen Profile erstellt; Besuche werden anonymisiert und aggregiert ausgewertet (z. B. Seitenaufrufe, Klicks auf Schaltflächen wie «Gönner werden»).",
      "Zusätzlich setze ich Google Analytics 4 ein. Es wird nur nach deiner Zustimmung über den Google Tag Manager geladen (siehe Abschnitt «Cookies & lokale Speicherung»).",
    ],
    bullets: [
      "Anbieter: Vercel Inc. (Hosting der Website)",
      "Zweck: anonyme Reichweiten- und Nutzungsstatistik",
      "Rechtsgrundlage: berechtigtes Interesse an der Verbesserung der Website",
    ],
  },
  {
    id: "youtube",
    title: "Eingebettete Videos (YouTube)",
    paragraphs: [
      "Einzelne Videos sind über YouTube eingebunden. Solange du nicht auf «Abspielen» klickst, wird nur ein Vorschaubild von dieser Website geladen — es werden keine Daten an YouTube übertragen.",
      "Erst mit dem Klick wird der Player im erweiterten Datenschutzmodus (youtube-nocookie.com) geladen. Dabei werden technische Daten wie deine IP-Adresse an Google übermittelt, und YouTube kann Cookies bzw. lokale Speicherung nutzen.",
    ],
    bullets: [
      "Anbieter: Google Ireland Limited (YouTube)",
      "Zweck: Wiedergabe von Videos",
      "Rechtsgrundlage: deine Einwilligung durch den Klick auf «Abspielen»",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & lokale Speicherung",
    paragraphs: [
      "Diese Website setzt primär technisch notwendige Cookies ein (z. B. für den Admin-Bereich oder Session-Verwaltung).",
      "Deine Wahl («Nur notwendige» oder «Analyse erlauben») wird lokal im Browser gespeichert (localStorage), damit der Hinweis nicht bei jedem Besuch erneut erscheint.",
      "Google Tag Manager und Google Analytics laden erst, wenn du «Analyse erlauben» wählst. Google setzt dann Analyse-Cookies und wertet Seitenaufrufe, Klicks und Anfragen aus. Dabei können technische Daten wie deine IP-Adresse an Google in den USA übermittelt werden. Ohne Zustimmung werden diese Dienste nicht geladen.",
      "Deine Wahl kannst du jederzeit über «Cookie-Einstellungen» im Footer ändern. Danach erscheint der Hinweis erneut.",
    ],
    bullets: [
      "mg-consent-v2 — Speichert deine Cookie-Wahl (lokal, kein Tracking)",
      "Google Analytics (_ga, _ga_…) — nur nach deiner Zustimmung",
      "Supabase-Auth-Cookies — nur im geschützten Admin-Bereich",
    ],
  },
  {
    id: "gonner",
    title: "Gönner, Fotos und Namensnennung",
    paragraphs: [
      "Bei den Gönnerturnieren in Domat/Ems entstehen Fotos und Videos. Diese dürfen für Website, Social Media und Newsletter verwendet werden. Teilnehmende werden darauf hingewiesen.",
      "Der Name von Gönnern wird auf der Website veröffentlicht. Wer das nicht wünscht, teilt es mit, dann wird die Nennung entfernt.",
    ],
    bullets: [
      "Zweck: Öffentlichkeitsarbeit und Dank an Unterstützende",
      "Rechtsgrundlage: Gönner-Vereinbarung bzw. berechtigtes Interesse an der Öffentlichkeitsarbeit",
    ],
  },
  {
    id: "turnier",
    title: "Turnier-Einladungen",
    paragraphs: [
      "Für Turniere werden eingeladene Mitglieder per E-Mail mit einem persönlichen Link angeschrieben. Über den Link werden Name, E-Mail und deine Antworten (Teilnahme, Clinic, Golfrunde, Dinner, Notiz) gespeichert. Die Angaben dienen ausschliesslich der Turnierplanung.",
    ],
    bullets: [
      "Zweck: Planung des Anlasses",
      "Rechtsgrundlage: Vertrag bzw. berechtigtes Interesse an der Organisation",
    ],
  },
  {
    id: "zahlungen",
    title: "Zahlungen und Vertragsführung",
    paragraphs: [
      "Gönnerbeiträge werden über den Zahlungsdienst RaiseNow AG (Schweiz) abgewickelt. RaiseNow verarbeitet die Zahlungsdaten laut Auftragsverarbeitungsvertrag in der EU (Server in Frankfurt). Weitere Unterauftragnehmer sind u. a. Datatrans, TWINT, Stripe und PayPal. Vertrag: https://www.raisenow.com/de-ch/avv",
      "Für Buchhaltung und Vertragsführung werden Name, Adresse, Mitgliedschaftsstufe, Beiträge und Zahlungseingänge in Supabase (Schweiz) gespeichert.",
    ],
  },
  {
    id: "aufbewahrung",
    title: "Aufbewahrung",
    paragraphs: [
      "Personendaten werden nur so lange gespeichert, wie es der Zweck verlangt oder das Gesetz vorschreibt.",
    ],
    bullets: [
      "Kontaktanfragen: 2 Jahre nach dem letzten Kontakt, danach gelöscht",
      "Turnier-Einladungen: 1 Jahr nach dem Turnier, danach gelöscht",
      "Gönner- und Vertragsdaten: 10 Jahre nach Ablauf des Geschäftsjahres, danach gelöscht",
      "Auswertungen zu Trends und Finanzen: nur anonymisiert, ohne Namen und Kontaktdaten",
      "Newsletter: bis zur Abmeldung",
      "Google Analytics: 14 Monate",
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

export const nutzungsbedingungenSections: LegalSection[] = [
  {
    id: "geltungsbereich",
    title: "Geltungsbereich",
    paragraphs: [
      "Diese Nutzungsbedingungen gelten für die Nutzung der Website maurogilardi.ch. Mit dem Besuch der Website akzeptierst du sie.",
    ],
  },
  {
    id: "inhalte",
    title: "Inhalte und Haftung",
    paragraphs: [
      "Die Inhalte werden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr übernommen. Ergebnisse, Ranglisten und Turnierdaten werden aus externen Quellen übernommen. Massgeblich sind die offiziellen Angaben der jeweiligen Veranstalter.",
    ],
  },
  {
    id: "links",
    title: "Externe Links",
    paragraphs: [
      "Verweise auf externe Websites liegen ausserhalb des Einflussbereichs des Betreibers. Für deren Inhalte ist der jeweilige Betreiber verantwortlich.",
    ],
  },
  {
    id: "urheberrecht",
    title: "Urheberrecht",
    paragraphs: [
      "Texte, Bilder, Grafiken, Logos und Videos sind urheberrechtlich geschützt. Eine Verwendung ausserhalb des privaten Gebrauchs braucht die schriftliche Zustimmung des Betreibers.",
    ],
  },
  {
    id: "anfragen",
    title: "Kontaktformular und Anfragen",
    paragraphs: [
      "Anfragen über das Kontaktformular oder per E-Mail werden in angemessener Frist beantwortet. Es besteht kein Anspruch auf eine bestimmte Antwortzeit. Das blosse Senden einer Anfrage führt nicht zu einem Vertragsabschluss.",
    ],
  },
  {
    id: "newsletter",
    title: "Newsletter",
    paragraphs: [
      "Die Anmeldung ist freiwillig und erfolgt aktiv über das Formular. Die Abmeldung ist jederzeit über den Link in jeder E-Mail möglich.",
    ],
  },
  {
    id: "goenner-verweis",
    title: "Gönner-, Partner- und 100er-Club-Mitgliedschaften",
    paragraphs: [
      "Mitgliedschaften und Sponsoring-Leistungen unterliegen den Gönner-Bedingungen. Sie sind unter https://www.maurogilardi.ch/goenner-bedingungen veröffentlicht.",
    ],
  },
  {
    id: "verfuegbarkeit",
    title: "Verfügbarkeit",
    paragraphs: [
      "Der Betreiber bemüht sich um eine störungsfreie Verfügbarkeit, garantiert sie jedoch nicht. Wartungsarbeiten oder Ausfälle von Drittdiensten sind möglich.",
    ],
  },
  {
    id: "recht",
    title: "Anwendbares Recht und Gerichtsstand",
    paragraphs: ["Es gilt Schweizer Recht. Gerichtsstand ist Wattwil."],
  },
  {
    id: "aenderungen",
    title: "Änderungen",
    paragraphs: [
      "Diese Bedingungen können jederzeit angepasst werden. Es gilt die jeweils veröffentlichte Fassung.",
      "Stand: 19.11.2026",
    ],
  },
];

export const goennerBedingungenSections: LegalSection[] = [
  {
    id: "vertragspartner",
    title: "Vertragspartner",
    paragraphs: [
      "Mauro Gilardi, SwissPGA Professional (Einzelfirma), Bleikenstrasse 6d, 9630 Wattwil, Schweiz (nachfolgend „Mauro Gilardi“).",
      "Gönner, Partner oder Mitglied des 100er Clubs (nachfolgend „Mitglied“).",
    ],
  },
  {
    id: "gegenstand",
    title: "Vertragsgegenstand",
    paragraphs: [
      "Das Mitglied unterstützt die Turnierkarriere und Öffentlichkeitsarbeit von Mauro Gilardi mit einem Beitrag in Geld, Prämien, Spesen, Material oder Verbandsleistungen. Die Stufe und die Art der Leistung werden bei Beitritt bestätigt.",
    ],
  },
  {
    id: "gegenleistungen",
    title: "Gegenleistungen",
    paragraphs: [
      "Mauro Gilardi erbringt die Gegenleistungen, die auf der Website für die jeweilige Stufe beschrieben sind, insbesondere:",
      "Der Umfang richtet sich nach den zeitlichen Möglichkeiten des Athleten. Eine Golfrunde kann verzichtet oder auf das Folgejahr verschoben werden. Turniere und sportliche Verpflichtungen haben Vorrang. Wenn kein Termin gefunden wird, ist das kein Kündigungsgrund.",
      "Die Gegenleistungen sind keine Garantie für sportliche Ergebnisse. Ein Anspruch auf eine bestimmte Platzierung oder Medienpräsenz besteht nicht.",
    ],
    bullets: [
      "Nennung des Mitglieds auf der Website und in Social Media",
      "Logo-Platzierung auf der Website und auf Materialien",
      "Einladungen zu Anlässen",
      "Berichte über Turniere und Ergebnisse",
    ],
  },
  {
    id: "beitrag",
    title: "Beitrag und Zahlung",
    paragraphs: [
      "Der Jahresbeitrag entspricht der bei Beitritt vereinbarten Stufe.",
      "Die Rechnung wird jeweils im Januar für die laufende Saison gestellt. Es gilt keine feste Zahlungsfrist. Bleibt eine Zahlung aus, wird nachgefasst.",
      "Die Unterstützung erfolgt jeweils zu Saisonbeginn oder beim Beitritt für die laufende Saison. Zahlungen sind nicht rückerstattungsfähig.",
      "Bei Sachleistungen (Material, Prämien, Spesen) wird der Wert bei Beitritt vereinbart. Es entsteht keine Zahlungspflicht in Geld.",
    ],
    bullets: [
      "Zahlung per Banküberweisung oder über den vorgesehenen Zahlungsdienst (z. B. TWINT)",
    ],
  },
  {
    id: "laufzeit",
    title: "Laufzeit und Kündigung",
    paragraphs: [
      "Die Mitgliedschaft verlängert sich automatisch für die folgende Saison, solange nicht ein Austritt mitgeteilt wurde.",
      "Die Kündigung ist jederzeit möglich, aus persönlichen oder anderen Gründen. Eine Begründung ist nicht erforderlich. Der Austritt muss an mauro.gilardi@hotmail.com mitgeteilt werden.",
      "Wird eine Zahlung versäumt, wird nachgefasst. Die Mitgliedschaft kann in Absprache mit der Person persönlich beendet werden, auch wenn eine Zahlung ausgeblieben ist.",
      "Bezahlte Beiträge werden nicht zurückerstattet.",
    ],
  },
  {
    id: "namensnutzung",
    title: "Namens-, Logo- und Fotonutzung",
    paragraphs: [
      "Mauro Gilardi darf den Namen und das Logo des Mitglieds für die vereinbarten Gegenleistungen nutzen. Das Mitglied stellt sicher, dass es die Rechte am Logo besitzt. Eine darüber hinausgehende Nutzung braucht die schriftliche Zustimmung.",
      "Das Mitglied erhält keine Rechte an Bildern, Texten oder Videos von Mauro Gilardi.",
      "Fotos und Videos, die an den Gönnerturnieren in Domat/Ems entstehen, darf Mauro Gilardi frei für Website, Social Media und Newsletter verwenden. Teilnehmende Gönner stimmen dem mit ihrer Teilnahme zu.",
      "Der Name von Gönnern wird auf der Website veröffentlicht. Wer das nicht möchte, teilt es mit. Ohne Mitteilung gilt die Nennung als zugestimmt.",
    ],
  },
  {
    id: "datenschutz",
    title: "Datenschutz",
    paragraphs: [
      "Personendaten werden gemäss der Datenschutzerklärung auf maurogilardi.ch bearbeitet. Die Daten dienen der Vertragsführung, Buchhaltung, Rechnungsstellung und der anonymisierten Auswertung zu Finanzen und Entwicklung. Die Aufbewahrung richtet sich nach der gesetzlichen Pflicht (10 Jahre für Geschäftsunterlagen).",
    ],
  },
  {
    id: "haftung",
    title: "Haftung",
    paragraphs: [
      "Mauro Gilardi haftet nur für Schäden, die er vorsätzlich oder grobfahrlässig verursacht. Für Ergebnisse von Turnieren, Verbänden oder Partnern übernimmt er keine Haftung.",
    ],
  },
  {
    id: "aenderungen",
    title: "Änderungen",
    paragraphs: [
      "Änderungen dieser Bedingungen bedürfen der Schriftform. Es gilt die jeweils bei Beitritt bestätigte Fassung.",
    ],
  },
  {
    id: "schluss",
    title: "Schlussbestimmungen",
    paragraphs: [
      "Es gilt Schweizer Recht. Gerichtsstand ist Wattwil.",
      "Sollte eine Bestimmung unwirksam sein, bleibt der übrige Vertrag gültig. Die unwirksame Bestimmung wird durch eine wirksame ersetzt, die dem Zweck möglichst nahekommt.",
      "Stand: 19.11.2026",
    ],
  },
];
