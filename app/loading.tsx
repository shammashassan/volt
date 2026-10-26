export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">Loading Volt...</span>
      </div>
    </div>
  )
}
