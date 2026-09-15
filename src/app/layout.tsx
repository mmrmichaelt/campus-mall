import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Campus Mall",
    template: "%s | Campus Mall",
  },
  description:
    "Campus Mall is a marketplace for students, campuses and communities to discover items, food, jobs and services.",
  applicationName: "Campus Mall",
  keywords: [
    "Campus Mall",
    "campus marketplace",
    "student marketplace",
    "university marketplace",
    "items",
    "food",
    "jobs",
    "services",
  ],
  authors: [
    {
      name: "Campus Mall",
    },
  ],
  creator: "Campus Mall",
  publisher: "Campus Mall",
  metadataBase: new URL(
    process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
  ),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#c9152d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
