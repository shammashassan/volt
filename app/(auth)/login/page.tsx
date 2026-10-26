import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedParams || {})) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          params.append(key, item);
        }
      }
    }
  }

  const query = params.toString();
  redirect(query ? `/sign-in?${query}` : "/sign-in");
}
