// src/components/common/Typography.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useStyles } from '../../hooks/useStyles';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';

interface TypographyProps extends TextProps {
    variant?: TypographyVariant;
    color?: 'primary' | 'secondary' | 'disabled' | 'error' | 'inherit';
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
    children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body1',
    color = 'inherit',
    align = 'left',
    bold = false,
    italic = false,
    style,
    children,
    ...props
}) => {
    const styles = useStyles((theme) => {
        // Define variant styles
        const variantStyles = {
            h1: {
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                lineHeight: theme.typography.lineHeight.relaxed,
            },
            h2: {
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                lineHeight: theme.typography.lineHeight.relaxed,
            },
            h3: {
                fontSize: theme.typography.fontSize.l,
                fontWeight: theme.typography.fontWeight.medium,
                lineHeight: theme.typography.lineHeight.normal,
            },
            h4: {
                fontSize: theme.typography.fontSize.m,
                fontWeight: theme.typography.fontWeight.medium,
                lineHeight: theme.typography.lineHeight.normal,
            },
            body1: {
                fontSize: theme.typography.fontSize.m,
                fontWeight: theme.typography.fontWeight.regular,
                lineHeight: theme.typography.lineHeight.normal,
            },
            body2: {
                fontSize: theme.typography.fontSize.s,
                fontWeight: theme.typography.fontWeight.regular,
                lineHeight: theme.typography.lineHeight.normal,
            },
            caption: {
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.regular,
                lineHeight: theme.typography.lineHeight.tight,
            },
            button: {
                fontSize: theme.typography.fontSize.m,
                fontWeight: theme.typography.fontWeight.medium,
                lineHeight: theme.typography.lineHeight.tight,
                textTransform: 'uppercase' as const,
            },
            overline: {
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.regular,
                lineHeight: theme.typography.lineHeight.tight,
                textTransform: 'uppercase' as const,
                letterSpacing: 1.5,
            },
        };

        // Define color styles
        const colorStyles = {
            primary: { color: theme.colors.primary },
            secondary: { color: theme.colors.secondary },
            disabled: { color: theme.colors.textDisabled },
            error: { color: theme.colors.error },
            inherit: {}, // No specific color - will inherit from parent
        };

        return {
            text: {
                ...variantStyles[variant],
                ...colorStyles[color],
                textAlign: align,
                ...(bold && { fontWeight: theme.typography.fontWeight.bold }),
                ...(italic && { fontStyle: 'italic' as const }),
            },
        };
    });

    return (
        <Text style={[styles.text, style]} {...props}>
            {children}
        </Text>
    );
};