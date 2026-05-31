import Link from "next/link";

type LandingLegalNoteProps = {
  className?: string;
  align?: "left" | "center";
};

export default function LandingLegalNote({
  className = "",
  align = "left",
}: LandingLegalNoteProps) {
  return (
    <p
      className={`font-inter text-xs leading-relaxed text-landing-foreground-soft/75 ${align === "center" ? "text-center" : "text-left"} ${className}`}
    >
      By using Epsilon, you agree to our{" "}
      <Link
        href="/terms"
        className="text-landing-foreground-soft underline-offset-2 hover:underline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        className="text-landing-foreground-soft underline-offset-2 hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
