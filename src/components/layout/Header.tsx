import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
}
