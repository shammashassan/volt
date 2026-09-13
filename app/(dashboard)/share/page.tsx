import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCategoriesAction } from "@/lib/actions/categories";
import { fetchUrlMetadata } from "@/lib/services/metadata.service";
import { ShareClient } from "@/components/share/share-client";

function ShareSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[500px]">
      <div className="w-full max-w-md p-6 border rounded-2xl bg-card/50 backdrop-blur-xs flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}

interface SharePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ShareContentWrapper({ searchParams }: SharePageProps) {
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

export default function SharePage({ searchParams }: SharePageProps) {
  return (
    <Suspense fallback={<ShareSkeleton />}>
      <ShareContentWrapper searchParams={searchParams} />
    </Suspense>
  );
}
