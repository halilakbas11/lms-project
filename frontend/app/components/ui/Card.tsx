'use client';

import { ReactNode, CSSProperties } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: CSSProperties;
}

export default function Card({
    children,
    className = '',
    hover = true,
    padding = 'md',
    style
}: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`
      bg-[var(--bg-card)] 
      rounded-2xl 
      border border-[var(--border-light)]
      shadow-[var(--shadow-md)]
      transition-all duration-200
      ${hover ? 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5' : ''}
      ${paddingStyles[padding]}
      ${className}
    `} style={style}>
            {children}
        </div>
    );
}

// Card Header
export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            {children}
        </div>
    );
}

// Card Title
export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <h3 className={`text-lg font-bold text-[var(--text-primary)] ${className}`}>
            {children}
        </h3>
    );
}

// Card Description
export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <p className={`text-sm text-[var(--text-secondary)] ${className}`}>
            {children}
        </p>
    );
}

// Card Content
export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

// Card Footer
export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-light)] ${className}`}>
            {children}
        </div>
    );
}
