import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserManagement, UserData } from "@/components/user/UserManagement";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage accounts, authorizations, and workspace role assignments.",
};

export default async function UsersPage() {
  await requireAdmin();
  const result = await auth.api.listUsers({
    query: {},
    headers: await headers()
  });

  const users = result.users;

  return (
    <UserManagement initialUsers={users as unknown as UserData[]} />
  );
}
