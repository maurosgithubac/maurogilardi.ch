import type { Metadata } from "next";
import { GoennerPageClient } from "@/components/goenner-page-client";

export const metadata: Metadata = {
  title: "Gönner | Mauro Gilardi",
  description: "Unterstütze mich auf der Tour — drei Mitgliedschaften, alles direkt bei mir anfragen.",
};

export default function GoennerPage() {
  return <GoennerPageClient />;
}
