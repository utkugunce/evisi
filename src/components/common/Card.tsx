import React from 'react';
import { createCSSVars } from '../../utils/styleUtils';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient';
    gradientColor?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card({
    children,
    className = '',
    variant = 'default',
    gradientColor,
    onClick,
    hoverable = false,
}: CardProps) {
    const style = gradientColor
        ? createCSSVars({ 'gradient-color': gradientColor })
        : undefined;

    const classes = `${styles.card} ${styles[variant]} ${hoverable ? styles.hoverable : ''} ${className}`;

    if (onClick) {
        return (
            <button
                type="button"
                className={classes}
                style={style}
                onClick={onClick}
            >
                {children}
            </button>
        );
    }

    return (
        <div className={classes} style={style}>
            {children}
        </div>
    );
}
