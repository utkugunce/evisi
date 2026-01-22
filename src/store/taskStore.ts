import { create } from 'zustand';
import type { Task, CompletionRecord } from '../types';
import * as db from '../services/database';
import { calculateNextDueDate } from '../services/scheduler';

interface TaskState {
    tasks: Task[];
    completions: CompletionRecord[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadTasks: () => Promise<void>;
    loadCompletions: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    completeTask: (taskId: string, notes?: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
    tasks: [],
    completions: [],
    isLoading: false,
    error: null,

    loadTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const tasks = await db.getAllTasks();
            set({ tasks, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    loadCompletions: async () => {
        try {
            const completions = await db.getAllCompletions();
            set({ completions });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    addTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
            const task: Task = {
                ...taskData,
                id: crypto.randomUUID(),
                createdAt: new Date(),
            };
            await db.createTask(task);
            set((state) => ({ tasks: [...state.tasks, task], isLoading: false }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await db.updateTask(id, updates);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await db.deleteTask(id);
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
                completions: state.completions.filter((c) => c.taskId !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    completeTask: async (taskId, notes) => {
        set({ isLoading: true, error: null });
        try {
            const task = get().tasks.find((t) => t.id === taskId);
            if (!task) throw new Error('Görev bulunamadı');

            const completedAt = new Date();
            const completion: CompletionRecord = {
                id: crypto.randomUUID(),
                taskId,
                completedAt,
                notes,
            };
            await db.createCompletion(completion);

            // Calculate next due date for recurring tasks
            const nextDueAt = task.recurrence === 'once'
                ? task.nextDueAt
                : calculateNextDueDate(task.recurrence, completedAt, task.recurrenceInterval);

            await db.updateTask(taskId, {
                lastCompletedAt: completedAt,
                nextDueAt,
                isActive: task.recurrence !== 'once',
            });

            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, lastCompletedAt: completedAt, nextDueAt, isActive: t.recurrence !== 'once' }
                        : t
                ),
                completions: [...state.completions, completion],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },
}));
