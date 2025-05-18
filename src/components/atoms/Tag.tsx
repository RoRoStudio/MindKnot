/**
 * Tag component for displaying and interacting with tags
 * @module components/atoms/Tag
 */
import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Typography } from './Typography';
import { Icon } from './Icon';

/**
 * Size variants for the Tag component
 */
export type TagSize = 'small' | 'medium' | 'large';

/**
 * Props for the Tag component
 * 
 * @interface TagProps
 */
export interface TagProps {
    /**
     * Tag text to display
     */
    label: string;

    /**
     * Size variant of the tag
     * @default 'medium'
     */
    size?: TagSize;

    /**
     * Whether the tag is selectable/toggleable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the tag is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Callback for when the tag is pressed (when selectable)
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
 * Tag component used for displaying categories, filters or metadata
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <Tag label="Technology" />
 * 
 * // Selectable tag
 * <Tag 
 *   label="Important" 
 *   selectable 
 *   selected={isSelected}
 *   onPress={() => setIsSelected(!isSelected)} 
 * />
 * 
 * // Removable tag
 * <Tag 
 *   label="React Native" 
 *   removable 
 *   onRemove={() => removeTag('React Native')} 
 * />
 * 
 * // Custom size
 * <Tag label="Small Tag" size="small" />
 * ```
 */
export const Tag: React.FC<TagProps> = ({
    label,
    size = 'medium',
    selectable = false,
    selected = false,
    onPress,
    removable = false,
    onRemove,
    style,
}) => {
    const styles = useThemedStyles((theme, constants) => ({
        tag: {
            // Make tags pill-shaped with border radius at half height
            borderRadius: 100, // Very high value ensures pill shape
            paddingHorizontal:
                size === 'small' ? theme.spacing.s :
                    size === 'medium' ? theme.spacing.m :
                        theme.spacing.l,
            paddingVertical:
                size === 'small' ? 4 :
                    size === 'medium' ? 6 :
                        8,
            backgroundColor: selected
                ? `${theme.colors.primary}15` // 15% opacity for selected background
                : theme.colors.surface, // Use surface color for better contrast
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            // Add border
            borderWidth: 1,
            borderColor: selected
                ? theme.colors.primary
                : theme.colors.border, // Use theme border color
        },
        text: {
            fontSize:
                size === 'small' ? theme.typography.fontSize.xs :
                    size === 'medium' ? theme.typography.fontSize.s :
                        theme.typography.fontSize.m,
            color: selected
                ? theme.colors.primary
                : theme.colors.textPrimary, // Use primary text color for better readability
            fontWeight: selected ? '500' : '400',
        },
        removeIcon: {
            marginLeft: theme.spacing.xs,
        }
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
            style={[styles.tag, style]}
            onPress={handlePress}
            disabled={!selectable && !removable}
            accessibilityRole={selectable ? "button" : undefined}
            accessibilityState={selectable ? { selected } : undefined}
        >
            <Typography style={styles.text}>
                {label}
            </Typography>

            {removable && (
                <TouchableOpacity
                    onPress={handleRemovePress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${label} tag`}
                >
                    <Icon
                        name="x"
                        size={size === 'small' ? 12 : size === 'medium' ? 14 : 16}
                        color={selected ? theme.colors.primary : theme.colors.textSecondary}
                        style={styles.removeIcon}
                    />
                </TouchableOpacity>
            )}
        </Wrapper>
    );
};

export default Tag; 