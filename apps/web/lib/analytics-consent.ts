export const ANALYTICS_CONSENT_KEY = "epsilon-analytics-consent";

export type AnalyticsConsent = "accepted" | "declined";

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
}

export const ANALYTICS_CONSENT_CHANGED = "epsilon-analytics-consent-changed";

export function notifyAnalyticsConsentChanged() {
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGED));
}
