import type { CSSProperties } from 'react';

/**
 * Creates a CSS properties object with a custom CSS variable.
 * This is used for dynamic styling where colors come from data.
 * 
 * Note: Using inline styles for CSS custom properties is a valid pattern
 * when the values are dynamic and come from runtime data (like category colors).
 */
export function createCSSVars(vars: Record<string, string | undefined>): CSSProperties {
    const cssVars: Record<string, string> = {};
    for (const [key, value] of Object.entries(vars)) {
        if (value !== undefined) {
            cssVars[`--${key}`] = value;
        }
    }
    return cssVars as CSSProperties;
}

/**
 * Creates background and color styles for a colored icon container.
 */
export function createIconContainerStyle(color: string | undefined): CSSProperties {
    if (!color) return {};
    return {
        background: `${color}20`,
        color: color,
    };
}

/**
 * Creates progress bar style with width and background color.
 */
export function createProgressStyle(widthPercent: number, color: string | undefined): CSSProperties {
    return {
        width: `${widthPercent}%`,
        background: color || 'var(--color-primary)',
    };
}
