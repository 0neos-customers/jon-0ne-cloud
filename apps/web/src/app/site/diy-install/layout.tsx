import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DIY Install Guide — PROJECT1.ai",
  description:
    "Self-guided install: set up your Telegram bot, Slack app, and voice keys, then run the 0ne installer.",
};

export default function DIYInstallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
