import { WebApplication, WithContext } from "schema-dts";
import Landing from "../../features/landing/mainLanding";
import { SITE_INFO } from "../../config/site";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPageJsonLd()).replace(/</g, "\\u003c"),
        }}
      />

      <div data-color-theme="light">
        <Landing />
      </div>
    </>
  );
}

function getPageJsonLd(): WithContext<WebApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Epsilon",
    url: SITE_INFO.url,
    image: SITE_INFO.ogImage,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    softwareVersion: "1.0",
    inLanguage: "en",
    description:
      "A fully customizable structured canvas workspace where individuals create visual spaces using flexible blocks.",
    creator: {
      "@type": "Person",
      name: "Kaustubh Sankhe",
      url: "https://kaustubh.cloud",
    },
    publisher: {
      "@type": "Person",
      name: "Kaustubh Sankhe",
      url: "https://kaustubh.cloud",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    potentialAction: {
      "@type": "UseAction",
      target: SITE_INFO.url,
    },
    featureList: [
      "Create multiple personal spaces",
      "Organize ideas visually",
      "Drag and arrange flexible blocks",
      "Structured infinite canvas",
      "Custom workspace layouts",
    ],
    sameAs: [
      "https://x.com/kaustubh_sankhe",
      "https://github.com/null-kaustubh/epsilon-app",
    ],
  };
}
