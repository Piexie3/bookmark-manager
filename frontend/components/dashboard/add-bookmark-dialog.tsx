"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBookmark,
  createTag,
  getCollections,
  getTags,
  type ApiCollection,
  type ApiTag,
} from "@/lib/api";
import { useAddBookmarkDialogStore } from "@/store/add-bookmark-dialog-store";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useTagsStore } from "@/store/tags-store";
import { Loader2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddBookmarkDialog() {
  const { open, setOpen } = useAddBookmarkDialogStore();
  const fetchBookmarks = useBookmarksStore((s) => s.fetchBookmarks);
  const fetchCollections = useCollectionsStore((s) => s.fetchCollections);
  const fetchTags = useTagsStore((s) => s.fetchTags);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [collectionId, setCollectionId] = useState<number | "">("");
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTagOpen, setNewTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagLoading, setNewTagLoading] = useState(false);

  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionLoading, setNewCollectionLoading] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
      setError(null);
      getCollections().then(setCollections).catch(() => setCollections([]));
      getTags().then(setTags).catch(() => setTags([]));
    }
  }, [open]);

  useEffect(() => {
    if (open && collections.length > 0 && collectionId === "") {
      setCollectionId(collections[0].id);
    }
  }, [open, collections, collectionId]);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setCollectionId("");
    setTagIds([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required.");
      return;
    }
    if (!description.trim()) {
      setError("Notes / description is required.");
      return;
    }
    const cId = collectionId === "" ? collections[0]?.id : collectionId;
    if (cId === "" || cId === undefined) {
      setError("Please select a collection.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createBookmark({
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        collection_id: cId as number,
        tag_ids: tagIds.length > 0 ? tagIds : undefined,
      });
      await fetchBookmarks();
      await fetchCollections();
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bookmark");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setNewTagLoading(true);
    try {
      const created = await createTag({ name: newTagName.trim() });
      await fetchTags();
      setTags((prev) => [...prev, created]);
      setTagIds((prev) => [...prev, created.id]);
      setNewTagName("");
      setNewTagOpen(false);
    } finally {
      setNewTagLoading(false);
    }
  };

  const toggleTag = (id: number) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
            <DialogDescription>Add a new bookmark with URL, notes, collection, and tags.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Bookmark title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notes</Label>
              <textarea
                id="description"
                placeholder="Description or notes (required)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Collection</Label>
              <select
                value={collectionId === "" ? "" : String(collectionId)}
                onChange={(e) => setCollectionId(e.target.value ? Number(e.target.value) : "")}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-background [&>option]:text-foreground"
                required
              >
                <option value="">Select a collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {collections.length === 0 && (
                <p className="text-xs text-muted-foreground">No collections yet. Create one from your collections first.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Tags</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => setNewTagOpen(true)}
                >
                  <Tag className="size-3" />
                  New tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-md border border-input bg-transparent">
                {tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags yet. Add one above.</span>
                )}
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                      tagIds.includes(tag.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                Add Bookmark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Tag popup */}
      <Dialog open={newTagOpen} onOpenChange={setNewTagOpen}>
        <DialogContent className="sm:max-w-xs" showClose={true}>
          <DialogHeader>
            <DialogTitle>New Tag</DialogTitle>
            <DialogDescription>Create a tag to organize bookmarks.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newTagName">Name</Label>
              <Input
                id="newTagName"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewTagOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={newTagLoading || !newTagName.trim()}>
                {newTagLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
