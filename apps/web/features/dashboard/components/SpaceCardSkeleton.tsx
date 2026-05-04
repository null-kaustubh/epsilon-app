export function SpaceCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border w-full bg-secondary animate-pulse">
      <div className="w-23 h-23 rounded-md bg-muted shrink-0" />
      <div className="flex-1 flex flex-col gap-2 pt-1 min-w-0">
        {/* name */}
        <div className="h-4 w-2/3 rounded bg-muted" />
        {/* description line 1 */}
        <div className="h-3 w-full rounded bg-muted" />
        {/* description line 2 */}
        <div className="h-3 w-4/5 rounded bg-muted" />
        {/* timestamp */}
        <div className="h-3 w-1/4 rounded bg-muted mt-1" />
      </div>
    </div>
  );
}
