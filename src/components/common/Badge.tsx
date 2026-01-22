import styles from './Badge.module.css';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
            {children}
        </span>
    );
}
