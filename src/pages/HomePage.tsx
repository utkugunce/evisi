import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, AlertCircle, Clock } from 'lucide-react';
import { isToday, addDays, isBefore, startOfDay } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal } from '../components/common/Modal';
import { Card } from '../components/common/Card';
import type { Task } from '../types';
import styles from './HomePage.module.css';

export function HomePage() {
    const { tasks, loadTasks, completeTask, addTask, updateTask, deleteTask } = useTaskStore();
    const { loadCategories } = useCategoryStore();

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        loadCategories();
        loadTasks();
    }, [loadCategories, loadTasks]);

    const { overdueTasks, todayTasks, upcomingTasks, stats } = useMemo(() => {
        const now = startOfDay(new Date());
        const weekFromNow = addDays(now, 7);

        const active = tasks.filter((t: Task) => t.isActive);

        const overdue = active.filter((t: Task) => isBefore(new Date(t.nextDueAt), now));
        const today = active.filter((t: Task) => isToday(new Date(t.nextDueAt)));
        const upcoming = active.filter((t: Task) => {
            const dueDate = new Date(t.nextDueAt);
            return !isToday(dueDate) && !isBefore(dueDate, now) && isBefore(dueDate, weekFromNow);
        });

        return {
            overdueTasks: overdue,
            todayTasks: today,
            upcomingTasks: upcoming.sort((a: Task, b: Task) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime()),
            stats: {
                total: active.length,
                overdue: overdue.length,
                today: today.length,
                upcoming: upcoming.length,
            },
        };
    }, [tasks]);

    const handleComplete = (taskId: string) => {
        completeTask(taskId);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setShowTaskModal(true);
    };

    const handleDelete = (taskId: string) => {
        if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            deleteTask(taskId);
        }
    };

    const handleSubmit = (data: Omit<Task, 'id' | 'createdAt'>) => {
        if (editingTask) {
            updateTask(editingTask.id, data);
        } else {
            addTask(data);
        }
        setShowTaskModal(false);
        setEditingTask(null);
    };

    return (
        <div className={styles.page}>
            {/* Stats Section */}
            <div className={styles.statsGrid}>
                <Card variant="gradient" gradientColor="#6366F1" className={styles.statCard}>
                    <div className={styles.statIcon}><Calendar size={20} /></div>
                    <div className={styles.statValue}>{stats.total}</div>
                    <div className={styles.statLabel}>Aktif Görev</div>
                </Card>
                <Card variant="gradient" gradientColor="#EF4444" className={styles.statCard}>
                    <div className={styles.statIcon}><AlertCircle size={20} /></div>
                    <div className={styles.statValue}>{stats.overdue}</div>
                    <div className={styles.statLabel}>Gecikmiş</div>
                </Card>
                <Card variant="gradient" gradientColor="#F59E0B" className={styles.statCard}>
                    <div className={styles.statIcon}><Clock size={20} /></div>
                    <div className={styles.statValue}>{stats.today}</div>
                    <div className={styles.statLabel}>Bugün</div>
                </Card>
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <AlertCircle size={18} className={styles.dangerIcon} />
                        Gecikmiş Görevler
                    </h2>
                    <div className={styles.taskList}>
                        {overdueTasks.map((task: Task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onComplete={handleComplete}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Today's Tasks */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <Calendar size={18} />
                    Bugün Yapılacaklar
                </h2>
                {todayTasks.length > 0 ? (
                    <div className={styles.taskList}>
                        {todayTasks.map((task: Task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onComplete={handleComplete}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className={styles.emptyState}>
                        <p>🎉 Bugün için görev yok!</p>
                    </Card>
                )}
            </section>

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Clock size={18} />
                        Önümüzdeki 7 Gün
                    </h2>
                    <div className={styles.taskList}>
                        {upcomingTasks.map((task: Task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onComplete={handleComplete}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* FAB */}
            <button
                className={styles.fab}
                onClick={() => {
                    setEditingTask(null);
                    setShowTaskModal(true);
                }}
                aria-label="Yeni görev ekle"
            >
                <Plus size={24} />
            </button>

            {/* Task Modal */}
            <Modal
                isOpen={showTaskModal}
                onClose={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                }}
                title={editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
            >
                <TaskForm
                    initialData={editingTask || undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowTaskModal(false);
                        setEditingTask(null);
                    }}
                />
            </Modal>
        </div>
    );
}
