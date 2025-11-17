import { create } from 'zustand';
import { tagService } from '@/services/api/tags';
import type { Tag } from '@/types/api';

interface TagStoreState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
  updateTag: (tagId: string, name: string, color: string) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  clearError: () => void;
}

export const useTagStore = create<TagStoreState>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await tagService.getAll();
      set({ tags, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch tags';
      set({ error: message, isLoading: false });
    }
  },

  createTag: async (name, color) => {
    try {
      const tag = await tagService.create({ name, color });
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create tag';
      set({ error: message });
      throw error;
    }
  },

  updateTag: async (tagId, name, color) => {
    try {
      const updatedTag = await tagService.update(tagId, { name, color });
      set((state) => ({
        tags: state.tags.map((t) => (t.id === tagId ? updatedTag : t)),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update tag';
      set({ error: message });
      throw error;
    }
  },

  deleteTag: async (tagId) => {
    try {
      await tagService.delete(tagId);
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== tagId),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete tag';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
