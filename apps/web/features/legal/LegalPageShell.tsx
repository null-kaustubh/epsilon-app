import Link from "next/link";

export default function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-color-theme="light"
      className="h-dvh min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y bg-landing-background text-landing-foreground"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <header className="border-b border-landing-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link
            href="/"
            className="font-bodoni text-2xl font-bold uppercase text-landing-foreground hover:opacity-80"
          >
            Epsilon
          </Link>
          <Link
            href="/"
            className="font-inter text-sm text-landing-foreground-soft hover:underline"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 font-inter">
        <h1 className="font-bodoni text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-landing-foreground-soft/80">
          Last updated: {lastUpdated}
        </p>
        {children}
      </main>
    </div>
  );
}
