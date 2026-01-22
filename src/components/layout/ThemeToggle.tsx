import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
    const { theme, toggleTheme } = useSettingsStore();
    const isDark = theme === 'dark';

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={`${isDark ? 'Aydınlık' : 'Karanlık'} temaya geç`}
        >
            <div className={`${styles.track} ${isDark ? styles.dark : styles.light}`}>
                <div className={styles.thumb}>
                    {isDark ? <Moon size={14} /> : <Sun size={14} />}
                </div>
            </div>
        </button>
    );
}
