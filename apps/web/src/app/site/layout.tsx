import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./marketing.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "0ne — Personal AI Infrastructure",
  description:
    "Your personal AI command center. An all-in-one system that turns Claude into your executive assistant, accessible from terminal, mobile, and Slack.",
  openGraph: {
    title: "0ne — Personal AI Infrastructure",
    description:
      "Your personal AI command center. Turn Claude into your executive assistant.",
    url: "https://0neos.com",
    siteName: "0ne",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased marketing-root`}>
      {children}
    </div>
  );
}
