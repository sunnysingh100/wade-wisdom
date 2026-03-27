import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wade Wisdom — AI Knowledge from Zapier's Founder",
  description:
    "Chat with an AI powered by Wade Foster's public insights on startups, AI, productivity, remote work, and building Zapier into a $5B company.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
