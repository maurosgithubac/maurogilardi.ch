import type { Metadata } from "next";
import { GoennerPageClient } from "@/components/goenner-page-client";

export const metadata: Metadata = {
  title: "Sponsoring | Mauro Gilardi",
  description:
    "Unterstütze mich auf der Tour — Mitgliedschaften, Sponsoring-Pakete und alles direkt bei mir anfragen.",
};

export default function SponsoringPage() {
  return <GoennerPageClient />;
}
