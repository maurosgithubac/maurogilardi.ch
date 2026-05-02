type JsonValue = Record<string, unknown>;

export function SeoPageJsonLd({ schema }: { schema: JsonValue | JsonValue[] }) {
  const items = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {items.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </>
  );
}
