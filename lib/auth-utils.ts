import { headers } from "next/headers";
import { auth } from "./auth";
import { cache } from "react";

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user;
});

export async function checkApprovedUser() {
  const user = await getSessionUser();
  if (!user.isApproved) {
    throw new Error("Forbidden: User is not approved");
  }
  return user;
}

export async function checkAdminUser() {
  const user = await checkApprovedUser();
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
