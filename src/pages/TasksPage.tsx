import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { CategoryIcon } from '../components/categories/CategoryIcon';
import { createCSSVars } from '../utils/styleUtils';
import type { Task, Category } from '../types';
import styles from './TasksPage.module.css';

export function TasksPage() {
    const { tasks, completeTask, addTask, updateTask, deleteTask } = useTaskStore();
    const { categories } = useCategoryStore();

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showActiveOnly, setShowActiveOnly] = useState(true);

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (showActiveOnly) {
            result = result.filter((t: Task) => t.isActive);
        }

        if (selectedCategory) {
            result = result.filter((t: Task) => t.categoryId === selectedCategory);
        }

        return result.sort((a: Task, b: Task) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime());
    }, [tasks, selectedCategory, showActiveOnly]);

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
            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.categoryFilters}>
                    <button
                        className={`${styles.filterChip} ${!selectedCategory ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Tümü
                    </button>
                    {categories.map((cat: Category) => (
                        <button
                            key={cat.id}
                            className={`${styles.filterChip} ${selectedCategory === cat.id ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={createCSSVars({ 'cat-color': cat.color })}
                        >
                            <CategoryIcon name={cat.icon} size={14} />
                            {cat.name}
                        </button>
                    ))}
                </div>

                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={showActiveOnly}
                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                    />
                    <span>Sadece aktif</span>
                </label>
            </div>

            {/* Task List */}
            <div className={styles.taskList}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task: Task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={handleComplete}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className={styles.empty}>
                        <p>Görev bulunamadı</p>
                        <Button onClick={() => setShowTaskModal(true)} icon={<Plus size={18} />}>
                            Yeni Görev Ekle
                        </Button>
                    </div>
                )}
            </div>

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
