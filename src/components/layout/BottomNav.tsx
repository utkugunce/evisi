import { Home, ListTodo, History, BarChart3, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

interface BottomNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

const navItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'tasks', label: 'Görevler', icon: ListTodo },
    { id: 'history', label: 'Geçmiş', icon: History },
    { id: 'stats', label: 'İstatistik', icon: BarChart3 },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
    return (
        <nav className={styles.nav}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                    <button
                        key={item.id}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={() => onNavigate(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon size={22} />
                        <span className={styles.label}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
