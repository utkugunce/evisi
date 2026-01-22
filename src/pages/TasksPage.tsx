import { useState, useMemo } from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { useSettingsStore } from '../store/settingsStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { CategoryIcon } from '../components/categories/CategoryIcon';
import { createCSSVars } from '../utils/styleUtils';
import { aiService } from '../services/ai';
import type { Task, Category } from '../types';
import styles from './TasksPage.module.css';

export function TasksPage() {
    const { tasks, completeTask, addTask, updateTask, deleteTask } = useTaskStore();
    const { categories } = useCategoryStore();
    const { apiKey } = useSettingsStore();

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<{ title: string; description: string; categoryKeyword: string }[]>([]);

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

    const handleGenerateSuggestions = async () => {
        if (!apiKey) {
            alert('Lütfen önce Ayarlar sayfasından Gemini API anahtarınızı girin.');
            return;
        }

        setIsGenerating(true);
        setShowAiModal(true);

        try {
            const now = new Date();
            const hour = now.getHours();
            let timeOfDay = 'Gece';
            if (hour >= 6 && hour < 12) timeOfDay = 'Sabah';
            else if (hour >= 12 && hour < 18) timeOfDay = 'Öğleden Sonra';
            else if (hour >= 18 && hour < 22) timeOfDay = 'Akşam';

            const month = now.getMonth();
            let season = 'Kış';
            if (month >= 2 && month < 5) season = 'İlkbahar';
            else if (month >= 5 && month < 8) season = 'Yaz';
            else if (month >= 8 && month < 11) season = 'Sonbahar';

            if (!aiService.isInitialized()) {
                aiService.init(apiKey);
            }

            const results = await aiService.generateTaskSuggestions({
                season,
                timeOfDay,
                existingTasks: tasks,
            });

            setSuggestions(results);
        } catch (error) {
            alert('Öneri oluşturulurken hata: ' + (error as Error).message);
            setShowAiModal(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAcceptSuggestion = (suggestion: { title: string; description: string; categoryKeyword: string }) => {
        // Try to find a matching category
        let categoryId = categories[0]?.id;
        const keyword = suggestion.categoryKeyword.toLowerCase();

        const matchedCat = categories.find(c =>
            c.name.toLowerCase().includes(keyword) ||
            c.icon.toLowerCase().includes(keyword)
        );

        if (matchedCat) categoryId = matchedCat.id;

        setEditingTask({
            title: suggestion.title,
            description: suggestion.description,
            categoryId,
            recurrence: 'once',
            nextDueAt: new Date().toISOString(),
        } as any);

        setShowAiModal(false);
        setShowTaskModal(true);
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

            {/* AI Suggestion Button */}
            {apiKey && (
                <button
                    className={styles.aiButton}
                    onClick={handleGenerateSuggestions}
                    title="AI ile Görev Önerisi Al"
                >
                    <Sparkles size={20} />
                    <span>Öneri Al</span>
                </button>
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

            {/* AI Suggestions Modal */}
            <Modal
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                title="✨ AI Görev Önerileri"
            >
                <div className={styles.aiModalContent}>
                    {isGenerating ? (
                        <div className={styles.loadingState}>
                            <Loader2 className={styles.spinner} size={32} />
                            <p>Yapay zeka evinizi analiz ediyor...</p>
                        </div>
                    ) : (
                        <div className={styles.suggestionsList}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className={styles.suggestionCard}
                                    onClick={() => handleAcceptSuggestion(s)}
                                >
                                    <div className={styles.suggestionIcon}>
                                        <Sparkles size={16} />
                                    </div>
                                    <div className={styles.suggestionInfo}>
                                        <h4>{s.title}</h4>
                                        <p>{s.description}</p>
                                    </div>
                                    <div className={styles.suggestionAdd}>
                                        <Plus size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
