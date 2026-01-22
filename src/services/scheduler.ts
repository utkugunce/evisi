import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import type { RecurrenceType } from '../types';

export function calculateNextDueDate(
    recurrence: RecurrenceType,
    fromDate: Date = new Date(),
    customInterval?: number
): Date {
    switch (recurrence) {
        case 'once':
            return fromDate;
        case 'daily':
            return addDays(fromDate, 1);
        case 'weekly':
            return addWeeks(fromDate, 1);
        case 'biweekly':
            return addWeeks(fromDate, 2);
        case 'monthly':
            return addMonths(fromDate, 1);
        case 'quarterly':
            return addMonths(fromDate, 3);
        case 'yearly':
            return addYears(fromDate, 1);
        case 'custom':
            return addDays(fromDate, customInterval || 1);
        default:
            return fromDate;
    }
}

export function isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
}

export function isDueToday(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
}

export function isDueSoon(dueDate: Date, days: number = 7): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const futureDate = addDays(today, days);
    return due > today && due <= futureDate;
}
