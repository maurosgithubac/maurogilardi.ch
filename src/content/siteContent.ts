export const siteContent = {
  brand: {
    short: "MG",
    name: "Mauro Gilardi",
    role: "SwissPGA | Spitzensport Golf",
    headline: "Aus der Heimat auf die internationale Tour.",
    intro:
      "Ich bin Mauro Gilardi. Mein Weg ist geprägt von Leidenschaft, harter Arbeit und starken Werten: Heimat, Bodenständigkeit und Familie.",
  },
  values: [
    {
      title: "Heimat",
      text: "Meine Wurzeln geben mir Orientierung und Kraft - auf und neben dem Platz.",
    },
    {
      title: "Bodenständigkeit",
      text: "Leistung entsteht durch tägliche Arbeit, Disziplin und den Blick fürs Wesentliche.",
    },
    {
      title: "Familie",
      text: "Ohne mein Umfeld wäre dieser Weg nicht möglich. Erfolg ist immer Teamarbeit.",
    },
  ],
  story: [
    "Nach einer guten ersten Saison auf der ProGolf Tour und vier gemachten Cuts auf der Challenge Tour setzte ich in meinem zweiten vollen Jahr (Saison 2025) klar auf die ProGolf Tour - mit dem Ziel, mein erstes Turnier zu gewinnen und im Finale um einen Top-5 Platz im Order of Merit zu spielen.",
    "Das Ziel ist es, regelmässig starke Events zu spielen und dadurch so schnell wie möglich in die Challenge Tour aufzusteigen. Dafür muss ich Ende des Jahres in den Top-5 des ProGolf Tour Order of Merit stehen.",
  ],
  tournaments: [
    {
      date: "Do., 19. Feb.",
      name: "PGT - Golf Mad Open 2026",
      tags: ["pgt", "2026"],
    },
    {
      date: "Mo., 23. Feb.",
      name: "PGT - Golf Mad Challenge 2026",
      tags: ["pgt", "2026"],
    },
    {
      date: "Di., 10. März",
      name: "PGT - Red Sea Ain Sokhna Open 2026",
      tags: ["pgt", "2026"],
    },
  ],
  news: [
    {
      month: "September 25",
      text: "Updates zu Training, Turnierplanung und den nächsten Schritten Richtung Top 5.",
    },
    {
      month: "August 25",
      text: "Intensive Wettkampfphase mit Fokus auf Konstanz und smarter Turnierstrategie.",
    },
    {
      month: "Juli 25",
      text: "Aufbauarbeit in Technik und Athletik als Basis für die zweite Saisonhälfte.",
    },
  ],
  partnerGroups: [
    { title: "Sponsoren", text: "Marken, die den Weg aktiv mittragen." },
    { title: "Arbeitgeber", text: "Menschen und Unternehmen, die Leistung ermöglichen." },
    { title: "Ausrüster / Ambassador", text: "Produkte, auf die ich mich verlassen kann." },
    { title: "Supporter", text: "Menschen im Hintergrund mit grosser Wirkung." },
    { title: "Partner", text: "Netzwerk aus Vertrauen, Qualität und Langfristigkeit." },
  ],
};

export type TournamentFilter = "all" | "pgt" | "2026";
