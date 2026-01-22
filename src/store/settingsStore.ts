import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '../types';

interface SettingsState extends AppSettings {
    apiKey?: string;
    setTheme: (theme: AppSettings['theme']) => void;
    setApiKey: (key: string) => void;
    toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            language: 'tr',
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',

            setApiKey: (key) => set({ apiKey: key }),

            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },

            toggleTheme: () => {
                const current = get().theme;
                const next = current === 'dark' ? 'light' : 'dark';
                set({ theme: next });
                applyTheme(next);
            },
        }),
        {
            name: 'evitakip-settings',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyTheme(state.theme);
                }
            },
        }
    )
);

function applyTheme(theme: AppSettings['theme']) {
    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
}
