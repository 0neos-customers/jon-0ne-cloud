"use client";

import { useState } from "react";

const SLACK_MANIFEST = `{
  "display_information": {
    "name": "0ne",
    "description": "Personal AI Infrastructure",
    "background_color": "#FF692D"
  },
  "features": {
    "bot_user": {
      "display_name": "one",
      "always_online": true
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "chat:write.customize",
        "im:history",
        "im:read",
        "im:write",
        "app_mentions:read",
        "users:read",
        "files:read",
        "files:write"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "bot_events": [
        "message.im",
        "app_mention"
      ]
    },
    "interactivity": {
      "is_enabled": false
    },
    "org_deploy_enabled": false,
    "socket_mode_enabled": true,
    "token_rotation_enabled": false
  }
}`;

export function SlackManifest() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(SLACK_MANIFEST);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8">
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-charcoal)]/10">
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-charcoal)]/5 border-b border-[var(--color-charcoal)]/5">
          <span className="text-xs font-mono text-[var(--color-muted)]">slack-app-manifest.json</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-white border border-[var(--color-charcoal)]/10 hover:border-[var(--color-charcoal)]/20 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Copied
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 11V3.5C3 2.67 3.67 2 4.5 2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-[var(--color-charcoal)] bg-white overflow-x-auto max-h-64 overflow-y-auto">{SLACK_MANIFEST}</pre>
      </div>
    </div>
  );
}

export function DownloadSlackIcon() {
  function handleDownload() {
    const a = document.createElement("a");
    a.href = "/0ne-Slack-Icon.jpg";
    a.download = "0ne-Slack-Icon.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-orange)] rounded-lg hover:bg-[var(--color-orange-dark)] transition-colors cursor-pointer"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1v10m0 0L4.5 7.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Download 0ne Icon
    </button>
  );
}
