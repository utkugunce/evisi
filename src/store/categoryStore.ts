import { create } from 'zustand';
import type { Category } from '../types';
import * as db from '../services/database';

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    loadCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>()((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    loadCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            await db.initializeDatabase();
            const categories = await db.getAllCategories();
            set({ categories, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addCategory: async (categoryData) => {
        set({ isLoading: true, error: null });
        try {
            const category: Category = {
                ...categoryData,
                id: crypto.randomUUID(),
                isDefault: false,
            };
            await db.createCategory(category);
            set((state) => ({ categories: [...state.categories, category], isLoading: false }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateCategory: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await db.updateCategory(id, updates);
            set((state) => ({
                categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await db.deleteCategory(id);
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
    },
}));
