// Task types
export interface Task {
    id: string;
    title: string;
    description?: string;
    categoryId: string;
    recurrence: RecurrenceType;
    recurrenceInterval?: number;
    lastCompletedAt?: Date;
    nextDueAt: Date;
    createdAt: Date;
    isActive: boolean;
}

export type RecurrenceType =
    | 'once'
    | 'daily'
    | 'weekly'
    | 'biweekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'custom';

// Category types
export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    isDefault: boolean;
}

// Completion record types
export interface CompletionRecord {
    id: string;
    taskId: string;
    completedAt: Date;
    notes?: string;
}

// Settings types
export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
}

// Recurrence labels for UI
export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
    once: 'Tek Seferlik',
    daily: 'Her Gün',
    weekly: 'Her Hafta',
    biweekly: 'İki Haftada Bir',
    monthly: 'Her Ay',
    quarterly: '3 Ayda Bir',
    yearly: 'Yılda Bir',
    custom: 'Özel',
};

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'appliances', name: 'Beyaz Eşya', icon: 'WashingMachine', color: '#3B82F6', isDefault: true },
    { id: 'small-appliances', name: 'Küçük Ev Aletleri', icon: 'Coffee', color: '#F59E0B', isDefault: true },
    { id: 'cleaning', name: 'Genel Temizlik', icon: 'SprayCan', color: '#10B981', isDefault: true },
    { id: 'filters', name: 'Filtre Bakımı', icon: 'Wind', color: '#8B5CF6', isDefault: true },
    { id: 'furniture', name: 'Mobilya Bakımı', icon: 'Sofa', color: '#EC4899', isDefault: true },
    { id: 'general', name: 'Genel Bakım', icon: 'Wrench', color: '#6B7280', isDefault: true },
];
