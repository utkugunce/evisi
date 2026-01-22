import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { useSettingsStore } from '../store/settingsStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CategoryIcon } from '../components/categories/CategoryIcon';
import { createProgressStyle, createIconContainerStyle } from '../utils/styleUtils';
import { aiService } from '../services/ai';
import type { Category, CompletionRecord, Task } from '../types';
import styles from './StatsPage.module.css';

export function StatsPage() {
    const { completions, tasks } = useTaskStore();
    const { categories, getCategoryById } = useCategoryStore();
    const { apiKey } = useSettingsStore();

    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const stats = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const weekCompletions = completions.filter((c: CompletionRecord) =>
            isWithinInterval(new Date(c.completedAt), { start: weekStart, end: weekEnd })
        );

        const monthCompletions = completions.filter((c: CompletionRecord) =>
            isWithinInterval(new Date(c.completedAt), { start: monthStart, end: monthEnd })
        );

        // Category stats
        const categoryStats = categories.map((cat: Category) => {
            const catCompletions = completions.filter((c: CompletionRecord) => {
                const task = tasks.find((t: Task) => t.id === c.taskId);
                return task?.categoryId === cat.id;
            });
            return {
                ...cat,
                count: catCompletions.length,
            };
        }).sort((a: Category & { count: number }, b: Category & { count: number }) => b.count - a.count);

        // Most completed tasks
        const taskCompletionCounts = new Map<string, number>();
        completions.forEach((c: CompletionRecord) => {
            const current = taskCompletionCounts.get(c.taskId) || 0;
            taskCompletionCounts.set(c.taskId, current + 1);
        });

        const topTasks = [...taskCompletionCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([taskId, count]) => {
                const task = tasks.find((t: Task) => t.id === taskId);
                const category = task ? getCategoryById(task.categoryId) : null;
                return { task, category, count };
            })
            .filter((t) => t.task) as { task: Task; category: Category | null; count: number }[];

        return {
            total: completions.length,
            weeklyCount: weekCompletions.length,
            monthlyCount: monthCompletions.length,
            categoryStats,
            topTasks,
        };
    }, [completions, tasks, categories, getCategoryById]);

    const handleAnalyze = async () => {
        if (!apiKey) {
            alert('Lütfen önce Ayarlar sayfasından Gemini API anahtarınızı girin.');
            return;
        }

        setIsAnalyzing(true);
        try {
            if (!aiService.isInitialized()) {
                aiService.init(apiKey);
            }

            const result = await aiService.analyzeTaskHistory(completions, tasks);
            setAnalysis(result);
        } catch (error) {
            alert('Analiz hatası: ' + (error as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const maxCategoryCount = Math.max(...stats.categoryStats.map((c: Category & { count: number }) => c.count), 1);

    return (
        <div className={styles.page}>
            {/* Overview Stats */}
            <div className={styles.overviewGrid}>
                <Card variant="gradient" gradientColor="#10B981" className={styles.overviewCard}>
                    <div className={styles.overviewValue}>{stats.total}</div>
                    <div className={styles.overviewLabel}>Toplam Tamamlanan</div>
                </Card>
                <Card variant="gradient" gradientColor="#3B82F6" className={styles.overviewCard}>
                    <div className={styles.overviewValue}>{stats.weeklyCount}</div>
                    <div className={styles.overviewLabel}>Bu Hafta</div>
                </Card>
                <Card variant="gradient" gradientColor="#8B5CF6" className={styles.overviewCard}>
                    <div className={styles.overviewValue}>{stats.monthlyCount}</div>
                    <div className={styles.overviewLabel}>Bu Ay</div>
                </Card>
            </div>

            {/* AI Analysis */}
            {apiKey && (
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <Sparkles size={20} className={styles.aiIcon} />
                            Yapay Zeka Analizi
                        </h2>
                    </div>

                    <Card className={styles.aiCard}>
                        {!analysis ? (
                            <div className={styles.aiEmptyState}>
                                <p>Tamamlama geçmişinize dayanarak kişisel içgörüler alın.</p>
                                <Button
                                    onClick={handleAnalyze}
                                    isLoading={isAnalyzing}
                                    icon={<Sparkles size={16} />}
                                >
                                    Analiz Et
                                </Button>
                            </div>
                        ) : (
                            <div className={styles.aiResult}>
                                <p>{analysis}</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAnalyze}
                                    isLoading={isAnalyzing}
                                    className={styles.refreshBtn}
                                >
                                    Yenile
                                </Button>
                            </div>
                        )}
                    </Card>
                </section>
            )}

            {/* Category Breakdown */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>📊 Kategori Dağılımı</h2>
                <Card className={styles.categoryChart}>
                    {stats.categoryStats.map((cat: Category & { count: number }) => (
                        <div key={cat.id} className={styles.categoryRow}>
                            <div className={styles.categoryInfo}>
                                <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                                <span>{cat.name}</span>
                            </div>
                            <div className={styles.categoryBar}>
                                <div
                                    className={styles.categoryProgress}
                                    style={createProgressStyle((cat.count / maxCategoryCount) * 100, cat.color)}
                                />
                            </div>
                            <span className={styles.categoryCount}>{cat.count}</span>
                        </div>
                    ))}
                </Card>
            </section>

            {/* Top Tasks */}
            {stats.topTasks.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🏆 En Çok Tamamlanan Görevler</h2>
                    <div className={styles.topTasksList}>
                        {stats.topTasks.map(({ task, category, count }: { task: Task; category: Category | null; count: number }, index: number) => (
                            <Card key={task.id} className={styles.topTaskCard}>
                                <div className={styles.topTaskRank}>#{index + 1}</div>
                                <div
                                    className={styles.topTaskIcon}
                                    style={createIconContainerStyle(category?.color)}
                                >
                                    <CategoryIcon name={category?.icon || 'HelpCircle'} size={20} />
                                </div>
                                <div className={styles.topTaskInfo}>
                                    <div className={styles.topTaskTitle}>{task.title}</div>
                                    <div className={styles.topTaskCategory}>{category?.name}</div>
                                </div>
                                <div className={styles.topTaskCount}>{count}x</div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
