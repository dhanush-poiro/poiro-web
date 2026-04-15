import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Poiro — Engineering Creativity | AI-Powered Brand Storytelling",
  description:
    "Where AI meets brand storytelling. Poiro is the operating system for storytelling — ship more, spend less, create without limits.",
  keywords: [
    "Poiro",
    "AI storytelling",
    "brand content",
    "creative automation",
    "content creation",
  ],
  openGraph: {
    title: "Poiro — Engineering Creativity",
    description:
      "Where AI meets brand storytelling. Ship more. Spend less. Create without limits.",
    images: ["/assets/opengraph-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poiro — Engineering Creativity",
    description:
      "Where AI meets brand storytelling. Ship more. Spend less. Create without limits.",
    images: ["/assets/twitter-image.png"],
  },
  icons: {
    icon: "/assets/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
