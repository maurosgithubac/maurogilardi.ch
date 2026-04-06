import type { Metadata } from "next";
import { GoennerPageClient } from "@/components/goenner-page-client";

export const metadata: Metadata = {
  title: "Gönner | Mauro Gilardi",
  description: "Gönner-Mitgliedschaften bei mir: Birdie, Eagle und Albatros — direkt an mich anfragen.",
};

export default function GoennerPage() {
  return <GoennerPageClient />;
}
