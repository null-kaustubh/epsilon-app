import type { Metadata } from "next";
import LegalPageShell from "../../features/legal/LegalPageShell";
import PolicySection from "../../features/legal/PolicySection";
import { PRIVACY_CONTACT_EMAIL, SITE_INFO } from "../../config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Epsilon collects, uses, and protects your data — accounts, uploads, cookies, and analytics.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "May 31, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className="mt-6 leading-relaxed text-landing-foreground-soft">
        Epsilon (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates{" "}
        <a
          href={SITE_INFO.url}
          className="text-landing-accent-surface underline-offset-2 hover:underline"
        >
          {SITE_INFO.url.replace(/^https?:\/\//, "")}
        </a>
        , a block-based canvas workspace. This policy explains what data we
        collect, why we collect it, and the choices you have.
      </p>

      <PolicySection title="What data we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account information</strong> — email address, username, and
            a hashed password when you register with email. If you sign in with
            Google or GitHub, we receive your email and profile identifier from
            that provider.
          </li>
          <li>
            <strong>Workspace content</strong> — spaces, blocks, text, and
            layout data you create in the app.
          </li>
          <li>
            <strong>Images and files</strong> — files you upload (for example,
            images attached to blocks), stored on our cloud storage provider.
          </li>
          <li>
            <strong>Session data</strong> — authentication cookies and session
            identifiers that keep you signed in.
          </li>
          <li>
            <strong>Analytics data</strong> — page views, navigation paths,
            device/browser type, and similar usage events collected through our
            analytics tools (see below).
          </li>
          <li>
            <strong>Error and performance data</strong> — technical logs and
            crash reports to help us fix bugs (via Sentry).
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Why we collect it">
        <ul className="list-disc space-y-2 pl-5">
          <li>To create and manage your account and authenticate you.</li>
          <li>To store, sync, and display your workspaces and uploads.</li>
          <li>To send transactional emails (welcome, password reset).</li>
          <li>To understand how the product is used and improve features.</li>
          <li>To monitor reliability, security, and fix errors.</li>
          <li>To comply with legal obligations where applicable.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>We use cookies and similar technologies for essential purposes:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Authentication</strong> — session cookies so you stay logged
            in across visits.
          </li>
          <li>
            <strong>Preferences</strong> — for example, your theme choice
            (light/dark) stored in a cookie.
          </li>
        </ul>
        <p className="mt-3">
          Optional analytics cookies (PostHog) are only enabled if you click
          &quot;Accept&quot; in our cookie banner. You can decline analytics and
          still use Epsilon. You can clear cookies in your browser settings;
          signing out removes your session cookie.
        </p>
      </PolicySection>

      <PolicySection title="Analytics">
        <p>
          We use{" "}
          <a
            href="https://posthog.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-landing-accent-surface underline-offset-2 hover:underline"
          >
            PostHog
          </a>{" "}
          for product analytics when enabled and when you have given consent
          (for example, page views and how you move through the app). PostHog
          may process IP address, browser metadata, and event timestamps. We do
          not sell your personal data.
        </p>
        <p className="mt-3">
          We also use{" "}
          <a
            href="https://sentry.io/privacy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-landing-accent-surface underline-offset-2 hover:underline"
          >
            Sentry
          </a>{" "}
          for error monitoring, which may include stack traces and request
          context when something fails.
        </p>
      </PolicySection>

      <PolicySection title="Third-party services">
        <p>We rely on trusted processors to run Epsilon, including:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Cloud hosting and file storage (e.g. AWS S3)</li>
          <li>Email delivery (Resend)</li>
          <li>Google and GitHub (OAuth sign-in)</li>
          <li>PostHog (analytics) and Sentry (errors)</li>
          <li>Supademo (embedded product demo on the landing page)</li>
        </ul>
        <p className="mt-3">
          Each provider has its own privacy policy governing how they handle
          data on our behalf.
        </p>
      </PolicySection>

      <PolicySection title="Data retention">
        <p>
          We keep your account and workspace data for as long as your account is
          active. Session records expire automatically. Analytics and error data
          are retained according to our providers&apos; settings and our
          operational needs, typically on the order of months unless a longer
          period is required for security or legal reasons.
        </p>
      </PolicySection>

      <PolicySection title="Data deletion">
        <p>
          You may request deletion of your account and associated personal data
          at any time by emailing us at{" "}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}?subject=Account%20deletion%20request`}
            className="text-landing-accent-surface underline-offset-2 hover:underline"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>{" "}
          from the email address linked to your account. Please include your
          username so we can verify ownership.
        </p>
        <p className="mt-3">
          After we confirm your request, we will delete or anonymize your
          account, workspaces, and uploads within a reasonable period (typically
          within 30 days), except where we must retain limited information for
          legal, security, or backup compliance. Backups may take additional
          time to cycle out.
        </p>
        <p className="mt-3">
          You can also sign out and stop using the service at any time; that
          does not automatically delete stored data until you request deletion.
        </p>
      </PolicySection>

      <PolicySection title="Your rights">
        <p>
          Depending on where you live, you may have rights to access, correct,
          export, or delete your personal data, and to object to or restrict
          certain processing. Contact us at the email below and we will respond
          within a reasonable time.
        </p>
      </PolicySection>

      <PolicySection title="Children">
        <p>
          Epsilon is not directed at children under 13 (or the minimum age in
          your jurisdiction). We do not knowingly collect data from children.
        </p>
      </PolicySection>

      <PolicySection title="Changes to this policy">
        <p>
          We may update this page from time to time. The &quot;Last
          updated&quot; date at the top will change when we do. Continued use of
          Epsilon after changes means you accept the revised policy.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about privacy or data requests:{" "}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
            className="text-landing-accent-surface underline-offset-2 hover:underline"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>
        </p>
      </PolicySection>
    </LegalPageShell>
  );
}
