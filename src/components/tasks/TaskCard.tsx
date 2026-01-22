import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Check, Clock, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Task } from '../../types';
import { useCategoryStore } from '../../store/categoryStore';
import { CategoryIcon } from '../categories/CategoryIcon';
import { Badge } from '../common/Badge';
import { isOverdue, isDueToday } from '../../services/scheduler';
import { createCSSVars } from '../../utils/styleUtils';
import styles from './TaskCard.module.css';

interface TaskCardProps {
    task: Task;
    onComplete: (taskId: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
    const getCategoryById = useCategoryStore((state) => state.getCategoryById);
    const category = getCategoryById(task.categoryId);

    const overdue = isOverdue(task.nextDueAt);
    const dueToday = isDueToday(task.nextDueAt);

    const getStatusBadge = () => {
        if (overdue) return <Badge variant="danger">Gecikmiş</Badge>;
        if (dueToday) return <Badge variant="warning">Bugün</Badge>;
        return null;
    };

    const formatDueDate = () => {
        return format(new Date(task.nextDueAt), 'd MMMM', { locale: tr });
    };

    return (
        <div
            className={`${styles.card} ${overdue ? styles.overdue : ''} ${dueToday ? styles.dueToday : ''}`}
            style={createCSSVars({ 'category-color': category?.color })}
        >
            <div className={styles.colorBar} />

            <div className={styles.content}>
                <div className={styles.main}>
                    <div className={styles.iconWrapper}>
                        <CategoryIcon name={category?.icon || 'HelpCircle'} size={24} color={category?.color} />
                    </div>

                    <div className={styles.info}>
                        <h3 className={styles.title}>{task.title}</h3>
                        <div className={styles.meta}>
                            <span className={styles.category}>{category?.name}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.date}>
                                <Clock size={12} />
                                {formatDueDate()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    {getStatusBadge()}

                    <button
                        className={styles.completeButton}
                        onClick={() => onComplete(task.id)}
                        aria-label="Görevi tamamla"
                    >
                        <Check size={18} />
                    </button>

                    <div className={styles.menu}>
                        <button className={styles.menuButton} aria-label="Menü">
                            <MoreVertical size={18} />
                        </button>
                        <div className={styles.menuDropdown}>
                            <button onClick={() => onEdit(task)}>
                                <Edit size={14} /> Düzenle
                            </button>
                            <button className={styles.deleteBtn} onClick={() => onDelete(task.id)}>
                                <Trash2 size={14} /> Sil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
