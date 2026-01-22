import Dexie, { type EntityTable } from 'dexie';
import type { Task, Category, CompletionRecord } from '../types';
import { DEFAULT_CATEGORIES } from '../types';

// Define database
const db = new Dexie('EviTakipDB') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    categories: EntityTable<Category, 'id'>;
    completions: EntityTable<CompletionRecord, 'id'>;
};

// Define schema
db.version(1).stores({
    tasks: 'id, categoryId, nextDueAt, isActive, createdAt',
    categories: 'id, isDefault',
    completions: 'id, taskId, completedAt',
});

// Initialize default categories
export async function initializeDatabase() {
    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
        await db.categories.bulkAdd(DEFAULT_CATEGORIES);
    }
}

// Task operations
export async function getAllTasks(): Promise<Task[]> {
    return db.tasks.toArray();
}

export async function getActiveTasks(): Promise<Task[]> {
    return db.tasks.where('isActive').equals(1).toArray();
}

export async function getTaskById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
}

export async function createTask(task: Task): Promise<string> {
    return db.tasks.add(task);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<number> {
    return db.tasks.update(id, updates);
}

export async function deleteTask(id: string): Promise<void> {
    await db.tasks.delete(id);
    // Also delete related completion records
    await db.completions.where('taskId').equals(id).delete();
}

// Category operations
export async function getAllCategories(): Promise<Category[]> {
    return db.categories.toArray();
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
    return db.categories.get(id);
}

export async function createCategory(category: Category): Promise<string> {
    return db.categories.add(category);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<number> {
    return db.categories.update(id, updates);
}

export async function deleteCategory(id: string): Promise<void> {
    await db.categories.delete(id);
}

// Completion operations
export async function getAllCompletions(): Promise<CompletionRecord[]> {
    return db.completions.toArray();
}

export async function getCompletionsByTaskId(taskId: string): Promise<CompletionRecord[]> {
    return db.completions.where('taskId').equals(taskId).toArray();
}

export async function createCompletion(completion: CompletionRecord): Promise<string> {
    return db.completions.add(completion);
}

export async function getCompletionsInRange(startDate: Date, endDate: Date): Promise<CompletionRecord[]> {
    return db.completions
        .where('completedAt')
        .between(startDate, endDate)
        .toArray();
}

export { db };
