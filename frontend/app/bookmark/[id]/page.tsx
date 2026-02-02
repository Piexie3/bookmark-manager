"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { getBookmarkById, toFrontendBookmark } from "@/lib/api";
import { type Bookmark } from "@/models/bookmark";

export default function BookmarkDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getBookmarkById(id)
      .then((apiBookmark) => setBookmark(toFrontendBookmark(apiBookmark)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load bookmark"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollowLink = () => {
    if (bookmark?.url) window.open(bookmark.url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !bookmark) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error ?? "Bookmark not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="size-4 mr-2" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="font-semibold truncate flex-1">{bookmark.title}</h1>
          <Button
            variant="default"
            size="sm"
            onClick={handleFollowLink}
            className="gap-2"
          >
            <ExternalLink className="size-4" />
            Open link
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">URL</p>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {bookmark.url}
          </a>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Notes</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-foreground">
              {bookmark.description || "No notes saved."}
            </p>
          </div>
        </div>

        {bookmark.tags.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button onClick={handleFollowLink} size="lg" className="gap-2">
            <ExternalLink className="size-4" />
            Follow link to site
          </Button>
        </div>
      </main>
    </div>
  );
}
