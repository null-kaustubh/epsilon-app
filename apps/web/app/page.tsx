import { WebApplication, WithContext } from "schema-dts";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPageJsonLd()).replace(/</g, "\\u003c"),
        }}
      />

      <div>Hi</div>
    </>
  );
}

function getPageJsonLd(): WithContext<WebApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Epsilon",
    url: "https://yourdomain.com", // to add links
    image: "https://epsilon.app/og.png", // to add links
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
      target: "https://epsilon.app", // change with domain
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
