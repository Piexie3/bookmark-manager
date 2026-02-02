import { Bookmark } from '@/models/bookmark';
import { Collection } from '@/models/collection';
import { Tag } from '@/models/tag';


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}
export interface ApiTag {
  id: number;
  name: string;
  color: string;
  count: number;
}

export interface ApiBookmark {
  id: number;
  title: string;
  url: string;
  description: string;
  collectionId: number;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
  hasDarkIcon: boolean;
}

export interface CreateBookmarkPayload {
  title: string;
  url: string;
  description: string;
  collection_id: number;
  tag_ids?: number[]; 
  is_favorite?: boolean;
}
export interface CreateTagPayload {
  name: string;
  color?: string;
}

export interface ApiCollection {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface CreateCollectionPayload {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateBookmarkPayload {
  title?: string;
  url?: string;
  description?: string;
  collection_id?: number;
  tag_ids?: number[];
  is_favorite?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  const baseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    (typeof process !== 'undefined' && process.env?.BASE_URL) ||
    'http://localhost:5000';
  const url = new URL(endpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
    // credentials: 'include'
  });

  let data: any;

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status} ${response.statusText}`;

    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.response = response;
    error.data = data;
    throw error;
  }

  return data as T;
}

export async function getBookmarks(): Promise<ApiBookmark[]> {
  return apiFetch<ApiBookmark[]>('/bookmarks');
}

export async function getBookmarkById(id: number | string): Promise<ApiBookmark> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<ApiBookmark>(`/bookmarks/${numericId}`);
}

export async function createBookmark(
  payload: CreateBookmarkPayload
): Promise<ApiBookmark> {
  return apiFetch<ApiBookmark>('/create-bookmark', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getTags(): Promise<ApiTag[]> {
  return apiFetch<ApiTag[]>('/tags');
}

export async function createTag(
  payload: CreateTagPayload
): Promise<ApiTag> {
  return apiFetch<ApiTag>('/create-tags', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
export async function deleteTag(id: number | string): Promise<{ success: boolean }> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<{ success: boolean }>(`/tags/${numericId}`, {
    method: 'DELETE',
  });
}

// ——— Collections (API doc: oxygene) ———
export async function getCollections(): Promise<ApiCollection[]> {
  return apiFetch<ApiCollection[]>('/collections');
}

export async function getCollectionById(id: number | string): Promise<ApiCollection> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<ApiCollection>(`/collections/${numericId}`);
}

export async function createCollection(
  payload: CreateCollectionPayload
): Promise<ApiCollection> {
  return apiFetch<ApiCollection>('/create-collection', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCollection(
  id: number | string,
  payload: { name?: string; icon?: string; color?: string }
): Promise<ApiCollection> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<ApiCollection>(`/collections/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCollection(id: number | string): Promise<{ success: boolean }> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<{ success: boolean }>(`/collections/${numericId}/delete`, {
    method: 'DELETE',
  });
}

// ——— Bookmarks update/delete ———
export async function updateBookmark(
  id: number | string,
  payload: UpdateBookmarkPayload
): Promise<ApiBookmark> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<ApiBookmark>(`/bookmarks/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteBookmark(id: number | string): Promise<{ success: boolean }> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return apiFetch<{ success: boolean }>(`/bookmarks/${numericId}`, {
    method: 'DELETE',
  });
}

// ——— Favorites ———
export async function getFavorites(): Promise<ApiBookmark[]> {
  return apiFetch<ApiBookmark[]>('/favorites');
}

export async function addFavorite(bookmarkId: number | string): Promise<ApiBookmark> {
  const numericId = typeof bookmarkId === 'string' ? Number(bookmarkId) : bookmarkId;
  return apiFetch<ApiBookmark>(`/favorites/${numericId}`, { method: 'POST' });
}

export async function removeFavorite(bookmarkId: number | string): Promise<{ success: boolean }> {
  const numericId = typeof bookmarkId === 'string' ? Number(bookmarkId) : bookmarkId;
  return apiFetch<{ success: boolean }>(`/favorites/${numericId}`, { method: 'DELETE' });
}

// ——— Vector search (top 15 by similarity) ———
export async function searchBookmarks(query: string): Promise<ApiBookmark[]> {
  if (!query?.trim()) return [];
  return apiFetch<ApiBookmark[]>('/bookmarks/search', {
    params: { q: query.trim(), limit: 15 },
  });
}

export function toFrontendBookmark(b: ApiBookmark): Bookmark {
  return {
    ...b,
    id: String(b.id),
    collectionId: String(b.collectionId),
    favicon: "",
    hasDarkIcon: b.hasDarkIcon ?? false,
  };
}
export function toFrontendTag(t: ApiTag): Tag {
  return { ...t, id: String(t.id) };
}
export const fallbackCollections: Collection[] = [
  {
    id: "all",
    name: "All Bookmarks",
    icon: "bookmark",
    color: "neutral",
    count: 0,
  },
];