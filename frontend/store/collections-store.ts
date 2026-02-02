import { create } from 'zustand';
import { Collection } from '@/models/collection';
import { getCollections, fallbackCollections } from '@/lib/api';

function toFrontendCollection(c: { id: number; name: string; icon: string; color: string; count: number }): Collection {
  return { ...c, id: String(c.id) };
}

interface CollectionsState {
  collections: Collection[];
  fetchCollections: () => Promise<void>;
  refresh: () => void;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: fallbackCollections,

  fetchCollections: async () => {
    try {
      const apiCollections = await getCollections();
      const allBookmarks: Collection = { ...fallbackCollections[0], count: 0 };
      const rest = apiCollections.map(toFrontendCollection);
      set({ collections: [allBookmarks, ...rest] });
    } catch {
      set({ collections: fallbackCollections });
    }
  },

  refresh: () => {
    get().fetchCollections();
  },
}));