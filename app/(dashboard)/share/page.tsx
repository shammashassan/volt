import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCategoriesAction } from "@/lib/actions/categories";
import { fetchUrlMetadata } from "@/lib/services/metadata.service";
import { ShareClient } from "@/components/share/share-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Share",
  description: "Share and save web links directly to your Volt workspace.",
};

interface SharePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const urlParam = typeof resolvedParams.url === "string" ? resolvedParams.url : "";
  const textParam = typeof resolvedParams.text === "string" ? resolvedParams.text : "";
  const titleParam = typeof resolvedParams.title === "string" ? resolvedParams.title : "";

  // Extract valid URL from parameters
  let extractedUrl = "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matchUrl = urlParam.match(urlRegex) || textParam.match(urlRegex);
  if (matchUrl) {
    extractedUrl = matchUrl[0];
  } else if (urlParam && urlParam.startsWith("http")) {
    extractedUrl = urlParam;
  } else if (textParam && textParam.startsWith("http")) {
    extractedUrl = textParam;
  }

  let initialMetadata = null;
  if (extractedUrl && extractedUrl.includes(".")) {
    try {
      initialMetadata = await fetchUrlMetadata(extractedUrl);
    } catch {
      // silent fallback
    }
  }

  // Fetch categories to pass to the client Quick-Save interface
  const categoriesResult = await getCategoriesAction();
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  return (
    <div className="flex flex-1 items-center justify-center p-4 lg:p-6 min-h-[calc(100vh-var(--header-height)-4rem)]">
      <ShareClient
        categories={categories}
        initialUrl={extractedUrl}
        initialTitle={titleParam}
        initialMetadata={initialMetadata}
      />
    </div>
  );
}
