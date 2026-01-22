import { useState } from 'react';
import { format } from 'date-fns';
import type { Task, RecurrenceType } from '../../types';
import { RECURRENCE_LABELS } from '../../types';
import { useCategoryStore } from '../../store/categoryStore';
import { Button } from '../common/Button';
import { CategoryIcon } from '../categories/CategoryIcon';
import { createCSSVars } from '../../utils/styleUtils';
import styles from './TaskForm.module.css';

interface TaskFormProps {
    initialData?: Partial<Task>;
    onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
    const categories = useCategoryStore((state) => state.categories);

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
    const [recurrence, setRecurrence] = useState<RecurrenceType>(initialData?.recurrence || 'monthly');
    const [recurrenceInterval, setRecurrenceInterval] = useState(initialData?.recurrenceInterval || 30);
    const [nextDueAt, setNextDueAt] = useState(
        initialData?.nextDueAt
            ? format(new Date(initialData.nextDueAt), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd')
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            description: description || undefined,
            categoryId,
            recurrence,
            recurrenceInterval: recurrence === 'custom' ? recurrenceInterval : undefined,
            nextDueAt: new Date(nextDueAt),
            isActive: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
                <label htmlFor="title" className={styles.label}>Görev Adı *</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Çamaşır makinesi temizliği"
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>Açıklama</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="İsteğe bağlı notlar..."
                    rows={3}
                    className={styles.textarea}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Kategori</label>
                <div className={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`${styles.categoryOption} ${categoryId === cat.id ? styles.selected : ''}`}
                            onClick={() => setCategoryId(cat.id)}
                            style={createCSSVars({ 'cat-color': cat.color })}
                        >
                            <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor="recurrence" className={styles.label}>Tekrar Sıklığı</label>
                    <select
                        id="recurrence"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                        className={styles.select}
                    >
                        {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                {recurrence === 'custom' && (
                    <div className={styles.field}>
                        <label htmlFor="interval" className={styles.label}>Kaç günde bir?</label>
                        <input
                            id="interval"
                            type="number"
                            min="1"
                            value={recurrenceInterval}
                            onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                            className={styles.input}
                        />
                    </div>
                )}
            </div>

            <div className={styles.field}>
                <label htmlFor="dueDate" className={styles.label}>Sonraki Tarih</label>
                <input
                    id="dueDate"
                    type="date"
                    value={nextDueAt}
                    onChange={(e) => setNextDueAt(e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    İptal
                </Button>
                <Button type="submit" disabled={!title.trim()}>
                    {initialData?.id ? 'Güncelle' : 'Oluştur'}
                </Button>
            </div>
        </form>
    );
}
