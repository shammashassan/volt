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
    <UserManagement initialUsers={users as any} />
  );
}
