const fs = require("fs");
const { Resend } = require("resend");

function readLocalEnv(path) {
  const text = fs.readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main() {
  const action = process.argv[2];
  if (!action || !["create", "get", "verify"].includes(action)) {
    console.log("Usage: node scripts/resend-domain-setup.js <create|get|verify>");
    process.exit(1);
  }

  const env = readLocalEnv(".env.local");
  const apiKey = env.RESEND_API_KEY;
  const domain = env.RESEND_DOMAIN || "maurogilardi.ch";
  const domainId = env.RESEND_DOMAIN_ID;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in .env.local");
  }

  const resend = new Resend(apiKey);

  if (action === "create") {
    const result = await resend.domains.create({ name: domain });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (!domainId) {
    throw new Error("Missing RESEND_DOMAIN_ID in .env.local");
  }

  if (action === "get") {
    const result = await resend.domains.get(domainId);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const result = await resend.domains.verify(domainId);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
