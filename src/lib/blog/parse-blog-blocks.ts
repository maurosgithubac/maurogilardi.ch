export type BlogTextBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string };

const MARKDOWN_HEADING = /^(#{2,3})\s+(.+)$/;
const SENTENCE_START =
  /^(Ich|Die|Der|Das|Den|Dem|Des|In|Im|Mit|Nach|Auf|Als|Für|So|Zum|Zur|Ein|Eine|Einer|Eines|Einem|Auch|Schlussendlich|Rückblickend|Danke|Bis|Mein|Meine|Positiv|Endlich|Durch|Zwei|Zufrieden|Natürlich|Leider|Mega|Aber|Am|An|Und|Oder|Wenn|Was|Wie|Wo|Warum|Obwohl|Trotzdem|Dadurch|Deshalb|Darum|Hier|Dort|Heute|Gestern|Morgen|Runde|Geteilter|Ocean|Der erste|Das zweite|Das Turnier|Die erste|Die zweite|Die dritte|Die letzte|In die|In der|Für mich|Als Erstes|Als Abschluss|Auf einmal|Let's)\b/i;
const SIGN_OFF = /^(Euer|Bis bald|Danke|Liebe Grüsse|Herzliche Grüsse)\b/i;

export function isLikelySectionHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.includes("\n")) return false;
  if (trimmed.startsWith("{{IMAGE:")) return false;
  if (trimmed.length < 2 || trimmed.length > 72) return false;
  if (/[.!?]$/.test(trimmed)) return false;
  if (trimmed.includes(",")) return false;
  if (/^[a-zäöüß]/.test(trimmed)) return false;
  if (SENTENCE_START.test(trimmed)) return false;
  if (SIGN_OFF.test(trimmed)) return false;
  // Colon usually marks a sentence lead-in, not a chapter title.
  if (trimmed.includes(":")) return false;
  return true;
}

function parseBlock(block: string): BlogTextBlock {
  const trimmed = block.trim();
  if (!trimmed) return { type: "paragraph", text: "" };

  const markdown = trimmed.match(MARKDOWN_HEADING);
  if (markdown) {
    return {
      type: "heading",
      level: markdown[1].length === 2 ? 2 : 3,
      text: markdown[2].trim(),
    };
  }

  if (!trimmed.includes("\n") && isLikelySectionHeading(trimmed)) {
    return { type: "heading", level: 2, text: trimmed };
  }

  return { type: "paragraph", text: trimmed };
}

export function parseBlogTextBlocks(text: string): BlogTextBlock[] {
  return text
    .split(/\n{2,}/)
    .map(parseBlock)
    .filter((block) => block.type === "paragraph" ? block.text.length > 0 : block.text.length > 0);
}
