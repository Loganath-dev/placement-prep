export default function RootSegmentLoading() {
  return (
    <div className="grid min-h-svh place-items-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="h-1.5 w-28 overflow-hidden rounded-sm bg-muted">
          <span className="block h-full w-1/2 animate-pulse rounded-sm bg-primary" />
        </span>
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  )
}
