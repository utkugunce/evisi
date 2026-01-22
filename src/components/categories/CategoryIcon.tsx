import {
    WashingMachine,
    Coffee,
    SprayCan,
    Wind,
    Sofa,
    Wrench,
    HelpCircle,
    type LucideProps
} from 'lucide-react';
import type { FC } from 'react';

const iconMap: Record<string, FC<LucideProps>> = {
    WashingMachine,
    Coffee,
    SprayCan,
    Wind,
    Sofa,
    Wrench,
    HelpCircle,
};

interface CategoryIconProps extends LucideProps {
    name: string;
    color?: string;
}

export function CategoryIcon({ name, color, size = 24, ...props }: CategoryIconProps) {
    const IconComponent = iconMap[name] || HelpCircle;
    return <IconComponent size={size} color={color} {...props} />;
}
