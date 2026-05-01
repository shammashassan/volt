import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserManagement } from "@/components/UserManagement";
import { UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function UsersPage() {
  const result = await auth.api.listUsers({
    query: {},
    headers: await headers()
  });

  const users = result.users;

  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UsersIcon className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  User Management
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {users.length} Total Users
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
            Manage user roles, approvals, and account statuses.
          </p>
        </div>

        <Separator className="opacity-40" />

        <UserManagement initialUsers={users as any} />
      </div>
    </div>
  );
}
