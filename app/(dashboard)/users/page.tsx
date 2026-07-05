import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserManagement, UserData } from "@/components/user/UserManagement";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loading component for Users Management page
function UsersSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-muted/50" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-48 bg-muted/50" />
                <Skeleton className="h-4 w-72 bg-muted/50" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-lg bg-muted/50 self-stretch sm:self-start" />
        </div>
      </section>

      {/* Main Content section skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tabs skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg bg-muted/50" />
            <Skeleton className="h-9 w-36 rounded-lg bg-muted/50" />
          </div>

          {/* Table container skeleton */}
          <div className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden p-6 space-y-4">
            {/* Table headers */}
            <div className="flex justify-between items-center pb-4 border-b border-muted/20">
              <Skeleton className="h-4 w-1/4 bg-muted/50" />
              <Skeleton className="h-4 w-1/6 bg-muted/50" />
              <Skeleton className="h-4 w-1/6 bg-muted/50" />
              <Skeleton className="h-4 w-1/12 bg-muted/50" />
            </div>
            {/* Table rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-muted/10 last:border-0">
                <div className="flex items-center gap-3 w-1/4">
                  <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 bg-muted/50" />
                    <Skeleton className="h-3 w-36 bg-muted/50" />
                  </div>
                </div>
                <Skeleton className="h-4 w-1/6 bg-muted/50" />
                <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
                <Skeleton className="h-8 w-8 rounded-lg bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Asynchronous wrapper to handle data fetching
async function UsersContentWrapper() {
  const result = await auth.api.listUsers({
    query: {},
    headers: await headers()
  });

  const users = result.users;

  return (
    <UserManagement initialUsers={users as unknown as UserData[]} />
  );
}

// Synchronous entry page for instant client-side navigation
export default function UsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContentWrapper />
    </Suspense>
  );
}
