import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "../../features/legal/LegalPageShell";
import PolicySection from "../../features/legal/PolicySection";
import { PRIVACY_CONTACT_EMAIL, SITE_INFO } from "../../config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of Epsilon — acceptable use, content ownership, termination, and liability.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "May 31, 2026";
const SITE_HOST = SITE_INFO.url.replace(/^https?:\/\//, "");

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p className="mt-6 leading-relaxed text-landing-foreground-soft">
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of Epsilon at{" "}
        <a
          href={SITE_INFO.url}
          className="text-landing-accent-surface underline-offset-2 hover:underline"
        >
          {SITE_HOST}
        </a>{" "}
        (&quot;Service&quot;), operated by Kaustubh Sankhe (&quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;). By creating an account or using the
        Service, you agree to these Terms and our{" "}
        <Link
          href="/privacy"
          className="text-landing-accent-surface underline-offset-2 hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <PolicySection title="Acceptable use">
        <p>You agree not to misuse the Service. Prohibited conduct includes:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Violating applicable laws or infringing others&apos; intellectual
            property, privacy, or other rights.
          </li>
          <li>
            Uploading malware, spam, or content that is illegal, harassing,
            hateful, or sexually exploitative of minors.
          </li>
          <li>
            Attempting to gain unauthorized access to accounts, systems, or data
            (including scraping private workspaces without permission).
          </li>
          <li>
            Interfering with or disrupting the Service (e.g. excessive
            automated requests, denial-of-service attempts).
          </li>
          <li>
            Reselling or sublicensing the Service without our written consent.
          </li>
        </ul>
        <p className="mt-3">
          We may investigate violations and cooperate with law enforcement where
          required.
        </p>
      </PolicySection>

      <PolicySection title="User content ownership">
        <p>
          You retain ownership of content you create or upload to Epsilon,
          including text, blocks, layouts, and files (&quot;User Content&quot;).
          You grant us a limited, non-exclusive license to host, store, back up,
          display, and process User Content solely to operate and improve the
          Service (for example, rendering your canvas and delivering uploads).
        </p>
        <p className="mt-3">
          You represent that you have the rights to submit User Content and that
          it does not violate these Terms or third-party rights. We do not claim
          ownership of your ideas or workspaces.
        </p>
      </PolicySection>

      <PolicySection title="Account termination">
        <p>
          You may stop using the Service at any time. You may request account
          deletion by emailing{" "}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}?subject=Account%20deletion%20request`}
            className="text-landing-accent-surface underline-offset-2 hover:underline"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>{" "}
          as described in our Privacy Policy.
        </p>
        <p className="mt-3">
          We may suspend or terminate your account if you breach these Terms,
          create risk or legal exposure for us, or if we discontinue the Service.
          Where practical, we will provide notice before termination for
          non-urgent matters. Upon termination, your right to access the Service
          ends; we may delete User Content after a reasonable period, subject to
          backups and legal retention requirements.
        </p>
      </PolicySection>

      <PolicySection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, the Service is provided
          &quot;as is&quot; without warranties of any kind, whether express or
          implied, including merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>
        <p className="mt-3">
          We are not liable for indirect, incidental, special, consequential, or
          punitive damages, or for loss of profits, data, goodwill, or business
          opportunities arising from your use of the Service.
        </p>
        <p className="mt-3">
          Our total liability for any claims relating to the Service is limited
          to the greater of (a) amounts you paid us in the twelve months before
          the claim, or (b) fifty U.S. dollars (USD $50), since the Service is
          currently offered without charge.
        </p>
        <p className="mt-3">
          Some jurisdictions do not allow certain limitations; in those cases, our
          liability is limited to the maximum extent allowed by law.
        </p>
      </PolicySection>

      <PolicySection title="Service availability">
        <p>
          We strive to keep Epsilon available and reliable, but we do not
          guarantee uninterrupted or error-free operation. The Service may be
          unavailable due to maintenance, updates, outages at third-party
          providers (hosting, storage, email), or events outside our reasonable
          control.
        </p>
        <p className="mt-3">
          We may modify, suspend, or discontinue features at any time. Beta or
          experimental features may change or be removed without notice.
        </p>
      </PolicySection>

      <PolicySection title="General">
        <p>
          These Terms constitute the entire agreement between you and us regarding
          the Service. If a provision is found unenforceable, the remaining
          provisions remain in effect. We may update these Terms; continued use
          after changes constitutes acceptance. The &quot;Last updated&quot; date
          reflects the current version.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about these Terms:{" "}
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
