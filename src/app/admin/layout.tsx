import type { Metadata, Viewport } from "next";
import "./admin.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Gönner-Admin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#121314",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
