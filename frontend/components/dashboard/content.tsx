"use client";

import { useBookmarksStore } from "@/store/bookmarks-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useTagsStore } from "@/store/tags-store";
import { BookmarkCard } from "./bookmark-card";
import { StatsCards } from "./stats-cards";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useEffect } from "react";

export function BookmarksContent() {
  const fetchBookmarks = useBookmarksStore((s) => s.fetchBookmarks);
  const fetchCollections = useCollectionsStore((s) => s.fetchCollections);
  const fetchTags = useTagsStore((s) => s.fetchTags);

  useEffect(() => {
    fetchTags();
    fetchBookmarks();
    fetchCollections();
  }, [fetchTags, fetchBookmarks, fetchCollections]);

  const {
    selectedCollection,
    getFilteredBookmarks,
    viewMode,
    selectedTags,
    toggleTag,
    filterType,
    setFilterType,
    sortBy,
    vectorSearchResults,
    clearVectorSearch,
    apiError,
  } = useBookmarksStore();

  const showingVectorSearch = vectorSearchResults.length > 0;
  const filteredBookmarks = getFilteredBookmarks();
  const displayBookmarks = showingVectorSearch ? vectorSearchResults : filteredBookmarks;
  const collections = useCollectionsStore((state) => state.collections);
  const tags = useTagsStore((state) => state.tags);

  const currentCollection = collections.find(
    (c) => c.id === selectedCollection
  );

  const activeTagsData = tags.filter((t) => selectedTags.includes(t.id));
  const hasActiveFilters =
    selectedTags.length > 0 || filterType !== "all" || sortBy !== "date-newest";

  return (
    <div className="flex-1 w-full overflow-auto">
      <div className="p-4 md:p-6 space-y-6">
        {apiError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-2">
            <span>{apiError}</span>
            <Button variant="outline" size="sm" onClick={() => fetchBookmarks()}>
              Retry
            </Button>
          </div>
        )}
        <StatsCards />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {showingVectorSearch ? (
                  <>
                    <Sparkles className="size-5 text-primary" />
                    Semantic search (top 15)
                  </>
                ) : (
                  currentCollection?.name || "All Bookmarks"
                )}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {displayBookmarks.length} bookmark
                  {displayBookmarks.length !== 1 ? "s" : ""}
                  {hasActiveFilters && !showingVectorSearch && " (filtered)"}
                </span>
                {showingVectorSearch && (
                  <Button variant="ghost" size="sm" className="h-auto py-0 text-xs" onClick={clearVectorSearch}>
                    Clear search
                  </Button>
                )}
              </div>
            </div>

            {(activeTagsData.length > 0 || filterType !== "all") && (
              <div className="flex flex-wrap items-center gap-2">
                {filterType !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {filterType === "favorites" && "Favorites only"}
                    {filterType === "with-tags" && "With tags"}
                    {filterType === "without-tags" && "Without tags"}
                    <button
                      onClick={() => setFilterType("all")}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {activeTagsData.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground"
                  >
                    {tag.name}
                    <button
                      onClick={() => toggleTag(tag.id)}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayBookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  variant="list"
                />
              ))}
            </div>
          )}

          {displayBookmarks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="size-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1">No bookmarks found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Try adjusting your search or filter to find what you&apos;re
                looking for, or add a new bookmark.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
