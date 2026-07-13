import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Competency BARS Generator",
  description:
    "Generate Behaviourally Anchored Rating Scales for competency frameworks, powered by AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
