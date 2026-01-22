import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { CategoryIcon } from '../components/categories/CategoryIcon';
import { Card } from '../components/common/Card';
import { createIconContainerStyle } from '../utils/styleUtils';
import type { CompletionRecord, Task } from '../types';
import styles from './HistoryPage.module.css';

export function HistoryPage() {
    const { completions, tasks } = useTaskStore();
    const { getCategoryById } = useCategoryStore();

    const monthDays = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(startOfMonth(now), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(now), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, []);

    const completionsByDate = useMemo(() => {
        const map = new Map<string, CompletionRecord[]>();
        completions.forEach((c: CompletionRecord) => {
            const key = format(new Date(c.completedAt), 'yyyy-MM-dd');
            const existing = map.get(key) || [];
            map.set(key, [...existing, c]);
        });
        return map;
    }, [completions]);

    const recentCompletions = useMemo(() => {
        return [...completions]
            .sort((a: CompletionRecord, b: CompletionRecord) =>
                new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            )
            .slice(0, 20);
    }, [completions]);

    const getTaskInfo = (taskId: string) => {
        const task = tasks.find((t: Task) => t.id === taskId);
        if (!task) return null;
        const category = getCategoryById(task.categoryId);
        return { task, category };
    };

    return (
        <div className={styles.page}>
            {/* Calendar View */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>📅 {format(new Date(), 'MMMM yyyy', { locale: tr })}</h2>
                <Card className={styles.calendar}>
                    <div className={styles.weekDays}>
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                            <div key={day} className={styles.weekDay}>{day}</div>
                        ))}
                    </div>
                    <div className={styles.days}>
                        {monthDays.map((day) => {
                            const key = format(day, 'yyyy-MM-dd');
                            const dayCompletions = completionsByDate.get(key) || [];
                            const isCurrentMonth = day.getMonth() === new Date().getMonth();
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={key}
                                    className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                                >
                                    <span className={styles.dayNumber}>{format(day, 'd')}</span>
                                    {dayCompletions.length > 0 && (
                                        <div className={styles.dots}>
                                            {dayCompletions.slice(0, 3).map((c: CompletionRecord, i: number) => {
                                                const info = getTaskInfo(c.taskId);
                                                return (
                                                    <span
                                                        key={i}
                                                        className={styles.dot}
                                                        style={createIconContainerStyle(info?.category?.color)}
                                                    />
                                                );
                                            })}
                                            {dayCompletions.length > 3 && (
                                                <span className={styles.moreDots}>+{dayCompletions.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </section>

            {/* Recent Completions */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>🕐 Son Tamamlananlar</h2>
                {recentCompletions.length > 0 ? (
                    <div className={styles.historyList}>
                        {recentCompletions.map((completion: CompletionRecord) => {
                            const info = getTaskInfo(completion.taskId);
                            if (!info) return null;

                            return (
                                <div key={completion.id} className={styles.historyItem}>
                                    <div
                                        className={styles.historyIcon}
                                        style={createIconContainerStyle(info.category?.color)}
                                    >
                                        <CategoryIcon name={info.category?.icon || 'HelpCircle'} size={18} />
                                    </div>
                                    <div className={styles.historyInfo}>
                                        <div className={styles.historyTitle}>{info.task.title}</div>
                                        <div className={styles.historyDate}>
                                            {format(new Date(completion.completedAt), 'd MMMM yyyy, HH:mm', { locale: tr })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <Card className={styles.empty}>
                        <p>Henüz tamamlanan görev yok</p>
                    </Card>
                )}
            </section>
        </div>
    );
}
