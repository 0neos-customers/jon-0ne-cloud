"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type DownloadStatus = "idle" | "downloading" | "done" | "error";

function DownloadContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<DownloadStatus>("idle");

  const startDownload = useCallback(async () => {
    if (!token) return;
    setStatus("downloading");

    try {
      const res = await fetch(`/api/download?token=${encodeURIComponent(token)}`);

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "0ne.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, [token]);

  // Auto-trigger download on load if token is present
  useEffect(() => {
    if (token && status === "idle") {
      startDownload();
    }
  }, [token, status, startDownload]);

  // No token → looks like a 404
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[var(--color-charcoal)] mb-4">404</h1>
          <p className="text-[var(--color-muted)]">This page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
      <div className="text-center max-w-md px-6">
        {status === "downloading" && (
          <>
            <div className="w-8 h-8 border-3 border-[var(--color-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[var(--color-charcoal)] font-medium">Preparing your download...</p>
          </>
        )}

        {status === "done" && (
          <>
            <div className="text-4xl mb-4">&#10003;</div>
            <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-2">Download started</h2>
            <p className="text-[var(--color-muted)] mb-6">
              Your 0ne install package is downloading. Unzip it and double-click{" "}
              <code className="text-sm bg-white px-1.5 py-0.5 rounded border border-[var(--color-charcoal)]/10">
                Install on Mac.command
              </code>{" "}
              to get started.
            </p>
            <button
              onClick={startDownload}
              className="text-sm text-[var(--color-orange)] hover:underline"
            >
              Download again
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-2">Download unavailable</h2>
            <p className="text-[var(--color-muted)] mb-6">
              This link may have expired or is invalid. Contact support if you believe this is an error.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
          <div className="w-8 h-8 border-3 border-[var(--color-orange)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DownloadContent />
    </Suspense>
  );
}
