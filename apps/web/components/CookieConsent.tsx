"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAnalyticsConsent,
  notifyAnalyticsConsentChanged,
  setAnalyticsConsent,
} from "../lib/analytics-consent";
import { initPostHog } from "../lib/posthog";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    setVisible(getAnalyticsConsent() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    setAnalyticsConsent("accepted");
    initPostHog();
    notifyAnalyticsConsentChanged();
    setVisible(false);
  };

  const decline = () => {
    setAnalyticsConsent("declined");
    notifyAnalyticsConsentChanged();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-100 border-t border-landing-border bg-landing-surface/95 px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-6"
      data-color-theme="light"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-inter text-sm leading-relaxed text-landing-foreground-soft">
          We use essential cookies to keep you signed in and remember your
          theme. With your permission, we also use PostHog analytics to
          understand how Epsilon is used. See our{" "}
          <Link
            href="/privacy"
            className="text-landing-accent-surface underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={decline}
            className="cursor-pointer rounded-full border border-landing-border px-4 py-2 font-inter text-sm text-landing-foreground-soft transition-colors hover:bg-landing-surface-2"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="cursor-pointer rounded-full bg-landing-foreground-soft px-4 py-2 font-inter text-sm font-medium text-landing-background transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
