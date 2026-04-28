import { Resend } from "resend";
import { readEnv } from "@/lib/env";

export function createResendClient(): Resend {
  const apiKey = readEnv("RESEND_API_KEY");
  return new Resend(apiKey);
}

