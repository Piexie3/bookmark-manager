import { create } from 'zustand';
import { ApiTag, getTags, createTag, deleteTag, CreateTagPayload } from '@/lib/api';
import { toFrontendTag } from '@/lib/api';
import { Tag } from '@/models/tag';

interface TagsState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  addTag: (payload: CreateTagPayload) => Promise<Tag | null>;
  removeTag: (id: string) => Promise<boolean>;
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiTags = await getTags();
      set({ tags: apiTags.map(toFrontendTag) });
    } catch (err) {
      set({ error: (err as Error).message || 'Failed to load tags' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addTag: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newApiTag = await createTag(payload);
      const newTag = toFrontendTag(newApiTag);
      set((state) => ({ tags: [...state.tags, newTag] }));
      return newTag;
    } catch (err) {
      set({ error: (err as Error).message || 'Failed to create tag' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  removeTag: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { success } = await deleteTag(id);
      if (success) {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
        }));
      }
      return success;
    } catch (err) {
      set({ error: (err as Error).message || 'Failed to delete tag' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
}));