export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Space not found
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          This space doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <a
          href="/home"
          className="text-link text-sm font-medium hover:underline"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
