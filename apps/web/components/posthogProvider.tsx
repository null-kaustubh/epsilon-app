"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_CHANGED,
  getAnalyticsConsent,
} from "../lib/analytics-consent";
import { initPostHog, posthog } from "../lib/posthog";

function capturePageview() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (getAnalyticsConsent() !== "accepted") return;
  posthog.capture("$pageview", { $current_url: window.location.href });
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (getAnalyticsConsent() === "accepted") {
      initPostHog();
      capturePageview();
    }

    const onConsentChange = () => {
      if (getAnalyticsConsent() === "accepted") {
        initPostHog();
        capturePageview();
      }
    };

    window.addEventListener(ANALYTICS_CONSENT_CHANGED, onConsentChange);
    return () =>
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED, onConsentChange);
  }, []);

  useEffect(() => {
    capturePageview();
  }, [pathname]);

  return <>{children}</>;
}
