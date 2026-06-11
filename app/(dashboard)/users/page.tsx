import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserManagement, UserData } from "@/components/UserManagement";


export default async function UsersPage() {
  const result = await auth.api.listUsers({
    query: {},
    headers: await headers()
  });

  const users = result.users;

  return (
    <UserManagement initialUsers={users as unknown as UserData[]} />
  );
}
