import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pb-2">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 lg:px-6 animate-pulse">
        <div className="flex flex-col gap-2 border-b border-border pb-6">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[148px] lg:col-span-1" />
          <Skeleton className="h-[148px] lg:col-span-1" />
          <Skeleton className="h-[148px] lg:col-span-1" />

          <Skeleton className="h-28 lg:col-span-2" />
          <Skeleton className="h-24 lg:col-span-1" />

          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-[210px] lg:col-span-1" />

          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-20" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-[102px]" />
              <Skeleton className="h-[102px]" />
              <Skeleton className="h-[102px]" />
              <Skeleton className="h-[102px]" />
            </div>
          </div>
          <Skeleton className="h-[288px] lg:col-span-1" />

          <Skeleton className="h-[270px] lg:col-span-2" />
          <Skeleton className="h-[270px] lg:col-span-1" />
        </div>
      </div>
    </div>
  )
}
