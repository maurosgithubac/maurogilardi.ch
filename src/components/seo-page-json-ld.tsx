/** Seiten-spezifisches JSON-LD — mehrere Knoten werden zu einem `@graph` zusammengefasst. */

type JsonValue = Record<string, unknown>;

/** JSON für <script> sicher serialisieren (kein vorzeitiges `</script>`). */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\u003c");
}

function stripContext(node: JsonValue): JsonValue {
  if (!("@context" in node)) return node;
  const rest: JsonValue = { ...node };
  delete rest["@context"];
  return rest;
}

export function SeoPageJsonLd({ schema }: { schema: JsonValue | JsonValue[] }) {
  const nodes = (Array.isArray(schema) ? schema : [schema]).flatMap((node) =>
    Array.isArray(node["@graph"]) ? (node["@graph"] as JsonValue[]) : [stripContext(node)],
  );
  const graph = { "@context": "https://schema.org", "@graph": nodes };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }} />;
}
