import Image from "next/image";
import Link from "next/link";

const BADGE_HEIGHT = 30;

const TWELVE_TOOLS = { width: 122, height: BADGE_HEIGHT };
const STARTUP_FAME = { width: 107, height: BADGE_HEIGHT };
const OPENHUNTS = { width: 139, height: BADGE_HEIGHT };

export default function FeaturedBadges({ className }: { className?: string }) {
  return (
    <div
      className={`
    flex items-center gap-1
    w-full
    max-md:overflow-x-auto
    md:overflow-visible
    max-md:scrollbar-none
    ${className ?? ""}
  `}
    >
      <Link
        href="https://twelve.tools"
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-7.5 shrink-0"
        style={{ width: TWELVE_TOOLS.width }}
      >
        <Image
          src="https://twelve.tools/badge0-white.svg"
          alt="Epsilon — Featured on Twelve Tools"
          fill
          priority
          className="object-contain object-left"
          sizes={`${TWELVE_TOOLS.width}px`}
        />
      </Link>
      <Link
        href="https://startupfa.me/s/epsilon?utm_source=epsilonapp.site"
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-7.5 shrink-0"
        style={{ width: STARTUP_FAME.width }}
      >
        <Image
          src="https://startupfa.me/badges/featured/light.webp"
          alt="Epsilon — Featured on Startup Fame"
          fill
          priority
          className="object-contain object-left"
          sizes={`${STARTUP_FAME.width}px`}
        />
      </Link>
      <Link
        href="https://openhunts.com"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        <Image
          alt="OpenHunts Club Member"
          src="https://cdn.openhunts.com/badges/club.webp"
          width={OPENHUNTS.width}
          height={OPENHUNTS.height}
        />
      </Link>
    </div>
  );
}
