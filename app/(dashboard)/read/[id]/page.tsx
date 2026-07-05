import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getReaderContentAction } from "@/lib/actions/resources";
import { ReaderView } from "@/components/reader-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReaderPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  // Parse page content
  const result = await getReaderContentAction(id);

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-var(--header-height)-4rem)] text-center gap-4">
        <div className="text-destructive font-semibold text-base">Could Not Open Reader Mode</div>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          {result.error || "Unable to scrape the article contents from this URL. This can happen if the website requires authentication, blocks web crawler queries, or is currently down."}
        </p>
      </div>
    );
  }

  return (
    <ReaderView
      resourceId={id}
      initialData={{
        title: result.data.title,
        url: result.data.url,
        content: result.data.content,
        wordCount: result.data.wordCount,
        readingTime: result.data.readingTime,
        scrollProgress: result.data.scrollProgress
      }}
    />
  );
}
