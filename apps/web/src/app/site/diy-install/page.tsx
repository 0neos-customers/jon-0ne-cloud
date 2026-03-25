"use client";

import Link from "next/link";
import { useState, useEffect, createContext, useContext } from "react";
import { SlackManifest, DownloadSlackIcon } from "../install/download-button";
import { TokenProvider, TokenField, TokenSummary, TokenDownload } from "../install/token-collector";

// OS Context for toggle state
const OSContext = createContext<{
  os: "mac" | "windows";
  setOS: (os: "mac" | "windows") => void;
}>({ os: "mac", setOS: () => {} });

function useOS() {
  return useContext(OSContext);
}

function OSProvider({ children }: { children: React.ReactNode }) {
  const [os, setOSState] = useState<"mac" | "windows">("mac");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("0ne-install-os");
    if (saved === "windows") {
      setOSState("windows");
    }
    setMounted(true);
  }, []);

  const setOS = (newOS: "mac" | "windows") => {
    setOSState(newOS);
    localStorage.setItem("0ne-install-os", newOS);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <OSContext.Provider value={{ os, setOS }}>
      {children}
    </OSContext.Provider>
  );
}

function OSToggle() {
  const { os, setOS } = useOS();

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <p className="text-sm font-medium text-[var(--color-charcoal)]">
        What computer are you using?
      </p>
      <div className="inline-flex rounded-xl bg-[var(--color-charcoal)]/5 p-1">
        <button
          onClick={() => setOS("mac")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            os === "mac"
              ? "bg-[var(--color-orange)] text-white shadow-sm"
              : "text-[var(--color-charcoal)] hover:text-[var(--color-orange)]"
          }`}
        >
          Mac
        </button>
        <button
          onClick={() => setOS("windows")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            os === "windows"
              ? "bg-[var(--color-orange)] text-white shadow-sm"
              : "text-[var(--color-charcoal)] hover:text-[var(--color-orange)]"
          }`}
        >
          Windows
        </button>
      </div>
    </div>
  );
}

function InstallerInstructions() {
  const { os } = useOS();

  return (
    <div className="mb-6">
      {os === "mac" ? (
        <div className="p-4 rounded-xl bg-white border border-[var(--color-orange)]/20">
          <p className="font-semibold mb-1">Mac</p>
          <p className="text-sm text-[var(--color-muted)]">
            Double-click{" "}
            <code className="px-1.5 py-0.5 rounded bg-[var(--color-charcoal)]/5 text-sm font-mono">Install on Mac.command</code>
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-2">
            If macOS blocks it: Right-click → Open → Open
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white border border-[var(--color-orange)]/20">
          <p className="font-semibold mb-1">Windows</p>
          <p className="text-sm text-[var(--color-muted)]">
            Double-click{" "}
            <code className="px-1.5 py-0.5 rounded bg-[var(--color-charcoal)]/5 text-sm font-mono">Install on Windows.bat</code>
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-2">
            If Windows SmartScreen blocks it: Click &quot;More info&quot; → &quot;Run anyway&quot;
          </p>
        </div>
      )}
    </div>
  );
}

function SystemRequirements() {
  const { os } = useOS();

  return (
    <section className="mb-12 p-6 rounded-2xl bg-[var(--color-charcoal)]/3 border border-[var(--color-charcoal)]/10">
      <h2 className="text-xl font-bold mb-4">System Requirements</h2>

      {os === "mac" ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange)] text-white text-xs flex items-center justify-center">✓</span>
            <div>
              <p className="font-medium">macOS 13.0 (Ventura) or later</p>
              <p className="text-sm text-[var(--color-muted)]">
                Check: Apple menu → About This Mac
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange)] text-white text-xs flex items-center justify-center">✓</span>
            <div>
              <p className="font-medium">Xcode Command Line Tools</p>
              <p className="text-sm text-[var(--color-muted)]">
                Run in Terminal: <code className="px-1 py-0.5 rounded bg-[var(--color-charcoal)]/5 text-xs font-mono">xcode-select --install</code>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-charcoal)]/20 text-[var(--color-charcoal)] text-xs flex items-center justify-center">!</span>
            <div>
              <p className="font-medium">4 GB RAM minimum</p>
              <p className="text-sm text-[var(--color-muted)]">8 GB+ recommended</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange)] text-white text-xs flex items-center justify-center">✓</span>
            <div>
              <p className="font-medium">Windows 10 (version 1809+) or Windows 11</p>
              <p className="text-sm text-[var(--color-muted)]">
                Check: Settings → System → About
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange)] text-white text-xs flex items-center justify-center">✓</span>
            <div>
              <p className="font-medium">Git for Windows (includes Git Bash)</p>
              <p className="text-sm text-[var(--color-muted)]">
                Download: <a href="https://git-scm.com/downloads/win" target="_blank" rel="noopener noreferrer" className="text-[var(--color-orange)] hover:underline">git-scm.com/downloads/win</a> — use all defaults
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange)] text-white text-xs flex items-center justify-center">✓</span>
            <div>
              <p className="font-medium">winget (Windows Package Manager)</p>
              <p className="text-sm text-[var(--color-muted)]">
                Install &quot;App Installer&quot; from Microsoft Store, or download from <a href="https://aka.ms/getwinget" target="_blank" rel="noopener noreferrer" className="text-[var(--color-orange)] hover:underline">aka.ms/getwinget</a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-charcoal)]/20 text-[var(--color-charcoal)] text-xs flex items-center justify-center">!</span>
            <div>
              <p className="font-medium">4 GB RAM minimum</p>
              <p className="text-sm text-[var(--color-muted)]">8 GB+ recommended</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function DIYInstallGuide() {
  return (
    <OSProvider>
      <DIYInstallContent />
    </OSProvider>
  );
}

function DIYInstallContent() {
  const { os } = useOS();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-[var(--color-charcoal)]"
        >
          PROJECT<span className="text-[var(--color-orange)]">1</span>.ai
        </Link>
        <span className="text-sm text-[var(--color-muted)]">DIY Install Guide</span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            DIY Install Guide
          </h1>
          <p className="text-lg text-[var(--color-muted)] max-w-2xl">
            Get your accounts and tokens ready before running the installer.
            Skip any service you don&apos;t need yet — you can always add them
            later. Save your tokens in the fields below as you go.
          </p>
        </div>

        {/* OS Toggle */}
        <OSToggle />

        {/* System Requirements */}
        <SystemRequirements />

        <TokenProvider>

        {/* Prerequisites */}
        <Section number="0" title="Prerequisites">
          <p className="text-[var(--color-muted)] mb-6">
            The only thing you need before you begin:
          </p>
          <PrereqCard
            name="Claude Pro or Max"
            description="Your AI subscription ($20-200/mo)"
            link="https://claude.com/pricing"
            linkText="claude.com/pricing"
          />
          <p className="text-sm text-[var(--color-muted)] mt-4">
            Everything else is installed automatically by the wizard.
          </p>
        </Section>

        {/* Cloud Sync */}
        <Section number="1" title="Cloud Sync (Recommended)">
          <p className="text-[var(--color-muted)] mb-6">
            Place your <Code>0ne</Code> folder inside a cloud-synced directory
            so you can access your files from your phone.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <SyncOption
              name="iCloud Drive"
              path="~/Library/Mobile Documents/com~apple~CloudDocs/"
              tag="Best for iPhone"
            />
            <SyncOption
              name="Google Drive"
              path="~/Google Drive/My Drive/"
              tag="Best for Android"
            />
            <SyncOption name="OneDrive" path="~/OneDrive/" />
            <SyncOption name="Dropbox" path="~/Dropbox/" />
          </div>
          <p className="text-sm text-[var(--color-muted)] mt-4">
            Pick whichever matches your phone. On a PC with an iPhone?{" "}
            <a
              href="https://apps.microsoft.com/detail/9pktq5699m62"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-orange)] hover:underline"
            >
              Download iCloud for Windows
            </a>{" "}
            — it works the same way.
          </p>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            This is optional. The system works fine without cloud sync — you
            just won&apos;t have mobile access to your files.
          </p>
        </Section>

        {/* Telegram */}
        <Section number="2" title="Telegram Bot">
          <p className="text-[var(--color-muted)] mb-6">
            Talk to your AI from your phone. Takes about 60 seconds.
          </p>
          <Steps>
            <Step n={1}>
              Download Telegram if you don&apos;t have it:{" "}
              <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" rel="noopener noreferrer" className="text-[var(--color-orange)] font-medium hover:underline">iPhone</a>
              {", "}
              <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer" className="text-[var(--color-orange)] font-medium hover:underline">Android</a>
              {", "}
              <a href="https://desktop.telegram.org" target="_blank" rel="noopener noreferrer" className="text-[var(--color-orange)] font-medium hover:underline">Desktop</a>
            </Step>
            <Step n={2}>
              Open Telegram and search for{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-orange)] font-medium hover:underline"
              >
                @BotFather
              </a>
            </Step>
            <Step n={3}>
              Send <Code>/newbot</Code>
            </Step>
            <Step n={4}>
              Give it a name like <Code>0ne</Code>
            </Step>
            <Step n={5}>
              Choose a username. Must end in <Code>bot</Code>. Try:
              <ul className="mt-2 ml-4 space-y-1 text-sm text-[var(--color-muted)]">
                <li><Code>yourname_one_bot</Code></li>
                <li><Code>yourname_ai_bot</Code></li>
                <li><Code>yourname_0ne_bot</Code></li>
                <li><Code>yourfirstlast_bot</Code></li>
              </ul>
            </Step>
            <Step n={6}>
              BotFather gives you a token like{" "}
              <Code>7123456789:AAF-abc123...</Code> — save it below.
            </Step>
          </Steps>
          <TokenField id="telegram_bot_token" label="Telegram Bot Token" placeholder="7123456789:AAF-abc123..." />
        </Section>

        {/* Slack */}
        <Section number="3" title="Slack App">
          <p className="text-[var(--color-muted)] mb-6">
            Your AI in your Slack workspace. We provide a pre-configured
            manifest with all the scopes set up for you.
          </p>

          <Steps>
            <Step n={1}>
              Go to{" "}
              <a
                href="https://api.slack.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-orange)] font-medium hover:underline"
              >
                api.slack.com/apps
              </a>
            </Step>
            <Step n={2}>
              Click <strong>Create New App</strong> →{" "}
              <strong>From an app manifest</strong>
            </Step>
            <Step n={3}>Select your workspace</Step>
            <Step n={4}>
              Copy and paste this manifest (JSON tab is default):
            </Step>
          </Steps>
          <SlackManifest />
          <Steps>
            <Step n={5}>
              Click <strong>Create</strong>
            </Step>
            <Step n={6}>
              Go to <strong>Basic Information</strong> → scroll to{" "}
              <strong>App-Level Tokens</strong> → Generate a token with scope{" "}
              <Code>connections:write</Code> → copy it (starts with{" "}
              <Code>xapp-</Code>)
            </Step>
            <Step n={7}>
              Go to <strong>OAuth &amp; Permissions</strong> →{" "}
              <strong>Install to Workspace</strong> → Allow → copy the{" "}
              <strong>Bot User OAuth Token</strong> (starts with{" "}
              <Code>xoxb-</Code>)
            </Step>
            <Step n={8}>
              Optional: <DownloadSlackIcon /> then go to{" "}
              <strong>Basic Information</strong> →{" "}
              <strong>Display Information</strong> → drag the icon onto the
              image area
            </Step>
          </Steps>
          <p className="text-sm text-[var(--color-muted)]">
            To find your Slack User ID: click your profile picture → Profile →
            the three dots menu → <strong>Copy member ID</strong>.
          </p>
          <TokenField id="slack_bot_token" label="Slack Bot Token" placeholder="xoxb-..." />
          <TokenField id="slack_app_token" label="Slack App Token" placeholder="xapp-..." />
          <TokenField id="slack_user_id" label="Slack User ID" placeholder="U0123ABC456" />
        </Section>

        {/* Voice */}
        <Section number="4" title="Voice (Optional)">
          <p className="text-[var(--color-muted)] mb-6">
            Send voice notes and hear spoken responses. Requires two free/paid
            API keys.
          </p>

          <h3 className="font-semibold mb-1">
            Groq — Voice Transcription (Free)
          </h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            Transcribes your voice notes so you can just talk to your AI.
          </p>
          <Steps>
            <Step n={1}>
              Go to{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-orange)] font-medium hover:underline"
              >
                console.groq.com
              </a>
            </Step>
            <Step n={2}>Create an account (free)</Step>
            <Step n={3}>
              Go to <strong>API Keys</strong> → Create a key → copy it
            </Step>
          </Steps>
          <TokenField id="groq_api_key" label="Groq API Key" placeholder="gsk_..." />

          <h3 className="font-semibold mb-1 mt-10">
            ElevenLabs — Voice Synthesis (Optional, Paid)
          </h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            Lets your AI talk back with realistic voice responses.
          </p>
          <Steps>
            <Step n={1}>
              Go to{" "}
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-orange)] font-medium hover:underline"
              >
                elevenlabs.io
              </a>
            </Step>
            <Step n={2}>Create an account</Step>
            <Step n={3}>
              Go to <strong>Profile + API key</strong> → copy your API key
            </Step>
            <Step n={4}>
              Optional: pick a voice from the Voice Library and copy its Voice ID
            </Step>
          </Steps>
          <TokenField id="elevenlabs_api_key" label="ElevenLabs API Key" placeholder="sk_..." />
          <TokenField id="elevenlabs_voice_id" label="ElevenLabs Voice ID" placeholder="Voice ID (optional)" />
        </Section>

        {/* You're Ready */}
        <Section number="5" title="You're Ready">
          <p className="text-[var(--color-muted)] mb-6">
            That&apos;s all the prep work. Download your tokens file and drop it
            in your <Code>0ne</Code> folder — the installer will pick it up
            automatically. Fields above are saved in your browser, nothing is
            sent to any server.
          </p>
          <TokenSummary />
          <TokenDownload />
          <p className="text-[var(--color-muted)] mt-8 mb-6">
            When you&apos;re ready, double-click the installer in your{" "}
            <Code>0ne</Code> folder:
          </p>
          <InstallerInstructions />
          <p className="text-[var(--color-muted)]">
            The installer reads your <Code>0ne-tokens.txt</Code> file
            automatically. Any missing tokens will be prompted during setup.
            You can always add or change them later by editing the{" "}
            <Code>.env</Code> file in your 0ne folder.
          </p>
        </Section>

        </TokenProvider>

        {/* Bonus */}
        <section className="mb-16" id="bonus">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)] text-sm font-bold">
              +
            </span>
            <h2 className="text-2xl font-bold">Bonus: Recommended Apps</h2>
          </div>
          <p className="text-[var(--color-muted)] mb-6">
            These apps make the most of your 0ne system on your phone.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <AppCard
              name="Claude"
              description="Chat with your AI on the go"
              links={[
                { label: "iPhone", href: "https://apps.apple.com/app/claude-by-anthropic/id6473753684" },
                { label: "Android", href: "https://play.google.com/store/apps/details?id=com.anthropic.claude" },
              ]}
            />
            <AppCard
              name="Obsidian"
              description="View and edit your files"
              links={[
                { label: "iPhone", href: "https://apps.apple.com/app/obsidian-connected-notes/id1557175442" },
                { label: "Android", href: "https://play.google.com/store/apps/details?id=md.obsidian" },
              ]}
            />
            <AppCard
              name="Telegram"
              description="Talk to your AI via text and voice"
              links={[
                { label: "iPhone", href: "https://apps.apple.com/app/telegram-messenger/id686449807" },
                { label: "Android", href: "https://play.google.com/store/apps/details?id=org.telegram.messenger" },
              ]}
            />
          </div>
        </section>

        {/* Back to top */}
        <div className="mt-16 pt-8 border-t border-[var(--color-charcoal)]/10 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-charcoal)] transition-colors"
          >
            ← Back to PROJECT1.ai
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ── Components ─────────────────────────────────────────────────── */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16" id={`step-${number}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-orange)] text-white text-sm font-bold">
          {number}
        </span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-4 mb-6">{children}</ol>;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-charcoal)]/5 text-xs font-semibold text-[var(--color-charcoal)]">
        {n}
      </span>
      <div className="text-[var(--color-charcoal)] leading-relaxed">
        {children}
      </div>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-[var(--color-charcoal)]/5 text-sm font-mono">
      {children}
    </code>
  );
}

function PrereqCard({
  name,
  description,
  link,
  linkText,
}: {
  name: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-white border border-[var(--color-charcoal)]/5 hover:border-[var(--color-orange)]/30 transition-colors max-w-sm"
    >
      <p className="font-semibold mb-1">{name}</p>
      <p className="text-sm text-[var(--color-muted)]">{description}</p>
      <p className="text-sm text-[var(--color-orange)] mt-2">{linkText} →</p>
    </a>
  );
}

function SyncOption({
  name,
  path,
  tag,
}: {
  name: string;
  path: string;
  tag?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white border border-[var(--color-charcoal)]/5">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-semibold">{name}</p>
        {tag && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-orange)]/10 text-[var(--color-orange)]">
            {tag}
          </span>
        )}
      </div>
      <p className="text-xs font-mono text-[var(--color-muted)]">{path}</p>
    </div>
  );
}

function AppCard({
  name,
  description,
  links,
}: {
  name: string;
  description: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="p-4 rounded-xl bg-white border border-[var(--color-charcoal)]/5">
      <p className="font-semibold mb-1">{name}</p>
      <p className="text-sm text-[var(--color-muted)] mb-3">{description}</p>
      <div className="flex gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-orange)] font-medium hover:underline"
          >
            {l.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
