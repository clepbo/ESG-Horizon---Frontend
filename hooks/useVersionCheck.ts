"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes
const VERSION_URL = "/version.json";

interface VersionInfo {
  buildId: string;
  buildTime: string;
}

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialBuildId = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const fetchVersion = useCallback(async (): Promise<VersionInfo | null> => {
    try {
      const res = await fetch(`${VERSION_URL}?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const checkForUpdate = useCallback(async () => {
    const version = await fetchVersion();
    if (!version) return;

    if (initialBuildId.current === null) {
      // First load — store current build ID
      initialBuildId.current = version.buildId;
      return;
    }

    if (version.buildId !== initialBuildId.current) {
      setUpdateAvailable(true);
      // Stop polling once we've detected an update
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [fetchVersion]);

  const hardRefresh = useCallback(() => {
    // Clear all caches we can, then reload
    if ("caches" in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
    window.location.reload();
  }, []);

  const dismiss = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  useEffect(() => {
    // Initial check
    checkForUpdate();

    // Poll periodically
    timerRef.current = setInterval(checkForUpdate, POLL_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [checkForUpdate]);

  // Also check when the tab regains focus (user returns after a while)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkForUpdate]);

  return { updateAvailable, hardRefresh, dismiss };
}
