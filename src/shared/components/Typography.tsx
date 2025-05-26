/**
 * Typography component for consistent text styling throughout the app
 * @module components/atoms/Typography
 */
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTextPresets } from '../hooks/useThemedStyles';

/**
 * Available typography variants
 */
export type TypographyVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'button'
    | 'overline'
    | 'label';

/**
 * Available text colors
 */
export type TypographyColor =
    | 'primary'
    | 'secondary'
    | 'disabled'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'inherit'
    | string;

/**
 * Text alignment options
 */
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Typography component props interface
 * 
 * @interface TypographyProps
 * @extends {TextProps}
 */
export interface TypographyProps extends TextProps {
    /**
     * The typographic variant to use
     * @default 'body1'
     */
    variant?: TypographyVariant;

    /**
     * The color of the text
     * @default 'inherit'
     */
    color?: TypographyColor;

    /**
     * Text alignment
     * @default 'left'
     */
    align?: TypographyAlign;

    /**
     * Whether the text should be bold
     * @default false
     */
    bold?: boolean;

    /**
     * Whether the text should be italic
     * @default false
     */
    italic?: boolean;

    /**
     * Content to be rendered within the Typography component
     */
    children: React.ReactNode;
}

/**
 * Typography component that provides consistent text styling across the app
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <Typography>Default body text</Typography>
 * 
 * // With variant
 * <Typography variant="h1">Heading 1</Typography>
 * 
 * // With custom styling
 * <Typography variant="body2" color="primary" bold>Emphasized text</Typography>
 * 
 * // With alignment
 * <Typography align="center">Centered text</Typography>
 * ```
 */
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
    // Use themed presets when available
    const presets = useTextPresets();

    const styles = useThemedStyles((theme, constants) => {
        // Use theme presets if available, otherwise use custom variant styles
        const mappedPresetName = getMappedPresetName(variant);
        const variantStyles = presets && mappedPresetName in presets ?
            presets[mappedPresetName as keyof typeof presets] :
            {
                h1: {
                    fontSize: theme.typography.fontSize.xxxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    letterSpacing: theme.typography.letterSpacing.tight,
                    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xxxl,
                },
                h2: {
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    letterSpacing: theme.typography.letterSpacing.tight,
                    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xxl,
                },
                h3: {
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    letterSpacing: theme.typography.letterSpacing.tight,
                    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xl,
                },
                h4: {
                    fontSize: theme.typography.fontSize.l,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.l,
                },
                h5: {
                    fontSize: theme.typography.fontSize.m,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.m,
                },
                h6: {
                    fontSize: theme.typography.fontSize.s,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.s,
                },
                subtitle1: {
                    fontSize: theme.typography.fontSize.m,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.m,
                },
                subtitle2: {
                    fontSize: theme.typography.fontSize.s,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.s,
                },
                body1: {
                    fontSize: theme.typography.fontSize.m,
                    fontWeight: theme.typography.fontWeight.regular,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.m,
                },
                body2: {
                    fontSize: theme.typography.fontSize.s,
                    fontWeight: theme.typography.fontWeight.regular,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.s,
                },
                caption: {
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.regular,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.xs,
                },
                button: {
                    fontSize: theme.typography.fontSize.m,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.m,
                    textTransform: 'uppercase' as const,
                },
                overline: {
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.regular,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.xs,
                    textTransform: 'uppercase' as const,
                    letterSpacing: theme.typography.letterSpacing.wide,
                },
                label: {
                    fontSize: theme.typography.fontSize.s,
                    fontWeight: theme.typography.fontWeight.medium,
                    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.s,
                },
            }[variant];

        // Define color styles
        let colorStyle = {};
        if (typeof color === 'string') {
            if (color === 'inherit') {
                // No specific color - will inherit from parent
                colorStyle = {};
            } else if (color in theme.colors) {
                // Use theme colors when a named color is provided
                colorStyle = { color: theme.colors[color as keyof typeof theme.colors] };
            } else {
                // Direct color value
                colorStyle = { color };
            }
        }

        return {
            text: {
                ...variantStyles,
                ...colorStyle,
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

/**
 * Maps component variant names to theme preset names
 * @param variant The component variant
 * @returns The corresponding theme preset name
 * @private
 */
function getMappedPresetName(variant: TypographyVariant): string {
    const mapping: Record<TypographyVariant, string> = {
        h1: 'heading1',
        h2: 'heading2',
        h3: 'heading3',
        h4: 'heading4',
        h5: 'heading5',
        h6: 'heading6',
        subtitle1: 'subtitle1',
        subtitle2: 'subtitle2',
        body1: 'body1',
        body2: 'body2',
        caption: 'caption',
        button: 'button',
        overline: 'overline',
        label: 'label',
    };

    return mapping[variant];
}

export default Typography; 