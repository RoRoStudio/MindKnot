/**
 * Label component for displaying and interacting with labels
 * @module components/atoms/Label
 */
import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from './Typography';
import { Icon } from './Icon';

/**
 * Size variants for the Label component
 */
export type LabelSize = 'small' | 'medium' | 'large';

/**
 * Props for the Label component
 * 
 * @interface LabelProps
 */
export interface LabelProps {
    /**
     * Label text to display
     */
    label: string;

    /**
     * Size variant of the label
     * @default 'medium'
     */
    size?: LabelSize;

    /**
     * Whether the label is selectable/toggleable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the label is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Callback for when the label is pressed (when selectable)
     */
    onPress?: () => void;

    /**
     * Whether to show a remove/close icon
     * @default false
     */
    removable?: boolean;

    /**
     * Callback for when the remove icon is pressed
     */
    onRemove?: () => void;

    /**
     * Optional additional styles for the container
     */
    style?: StyleProp<ViewStyle>;
}

/**
 * Label component used for displaying categories, filters or metadata
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <Label label="Technology" />
 * 
 * // Selectable label
 * <Label 
 *   label="Important" 
 *   selectable 
 *   selected={isSelected}
 *   onPress={() => setIsSelected(!isSelected)} 
 * />
 * 
 * // Removable label
 * <Label 
 *   label="React Native" 
 *   removable 
 *   onRemove={() => removeLabel('React Native')} 
 * />
 * 
 * // Custom size
 * <Label label="Small Label" size="small" />
 * ```
 */
export const Label: React.FC<LabelProps> = ({
    label,
    size = 'medium',
    selectable = false,
    selected = false,
    onPress,
    removable = false,
    onRemove,
    style,
}) => {
    const { theme } = useTheme();

    // Fixed heights for consistent appearance across the app
    const getLabelHeight = () => {
        switch (size) {
            case 'small': return 24;
            case 'medium': return 28;
            case 'large': return 32;
            default: return 28;
        }
    };

    const styles = useThemedStyles((theme, constants) => ({
        label: {
            // Make labels pill-shaped with border radius at half height
            borderRadius: 100, // Very high value ensures pill shape
            paddingHorizontal:
                size === 'small' ? theme.spacing.s :
                    size === 'medium' ? theme.spacing.m :
                        theme.spacing.l,
            paddingVertical:
                size === 'small' ? 2 :
                    size === 'medium' ? 3 :
                        4,
            height: getLabelHeight(),
            backgroundColor: theme.colors.surface,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            // Add border
            borderWidth: 1,
            borderColor: theme.colors.border,
            // Add shadow for more depth
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        text: {
            fontSize:
                size === 'small' ? theme.typography.fontSize.xs :
                    size === 'medium' ? theme.typography.fontSize.s :
                        theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            fontWeight: '400',
            marginTop: 0,
            marginBottom: 0,
            lineHeight:
                size === 'small' ? 16 :
                    size === 'medium' ? 18 :
                        20,
        },
        removeIcon: {
            marginLeft: theme.spacing.xs,
        },
        // No longer using these objects directly in style arrays, so just define what's needed
        selectableLabel: {
            backgroundColor: theme.colors.surfaceVariant,
            borderStyle: 'solid',
        },
        selectedLabel: {
            backgroundColor: `${theme.colors.primary}20`,
            borderColor: theme.colors.primary,
        },
        selectableText: {
            color: theme.colors.textSecondary,
        },
        selectedText: {
            color: theme.colors.primary,
            fontWeight: '500',
        },
    }));

    // Use appropriate wrapper component based on interactivity
    const Wrapper = selectable || removable ? TouchableOpacity : View;

    const handlePress = () => {
        if (selectable && onPress) {
            onPress();
        }
    };

    const handleRemovePress = (e: any) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <Wrapper
            style={[
                styles.label,
                selectable && { backgroundColor: theme.colors.surfaceVariant },
                selected && {
                    backgroundColor: `${theme.colors.primary}20`,
                    borderColor: theme.colors.primary
                },
                style
            ]}
            onPress={handlePress}
            disabled={!selectable && !removable}
            accessibilityRole={selectable ? "button" : undefined}
            accessibilityState={selectable ? { selected } : undefined}
        >
            <Typography
                style={[
                    styles.text,
                    selectable && { color: theme.colors.textSecondary },
                    selected && {
                        color: theme.colors.primary,
                        fontWeight: '500' as const
                    }
                ]}
                numberOfLines={1}
            >
                {label}
            </Typography>

            {removable && (
                <TouchableOpacity
                    onPress={handleRemovePress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${label} label`}
                >
                    <Icon
                        name="x"
                        size={size === 'small' ? 16 : size === 'medium' ? 18 : 20}
                        color={selected ? theme.colors.primary : theme.colors.textSecondary}
                        style={styles.removeIcon}
                        strokeWidth={2.5}
                    />
                </TouchableOpacity>
            )}
        </Wrapper>
    );
};

export default Label; 