"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const installedMode =
      window.matchMedia("(display-mode: standalone)").matches;

    if (installedMode) {
      setInstalled(true);
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      setInstalled(true);
    }

    setDeferredPrompt(null);
  }

  if (installed || !deferredPrompt) return null;

  return (
    <button
      onClick={installApp}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: 10,
        borderRadius: 12,
        border: "none",
        background: "#6D3DF5",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      📲 Pasang AINA pada Home Screen
    </button>
  );
}