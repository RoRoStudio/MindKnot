/**
 * Label component for displaying and interacting with labels
 * @module components/atoms/Label
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from './Icon';

/**
 * Different size variants for the Label component
 */
export type LabelSize = 'small' | 'medium' | 'large';

/**
 * Label component for displaying tags, categories, and other label-like elements
 * with optional selectable and removable functionality.
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
 * Label component - displays a text label with configurable appearance and behavior
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

    // Decide whether to render as touchable based on interactivity props
    const isInteractive = selectable || removable;

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
        },
        text: {
            color: theme.colors.textSecondary,
            fontSize: 12,
            fontWeight: '500',
        },
        removeIcon: {
            marginLeft: 4,
        },
        selected: {
            backgroundColor: theme.colors.primary,
        },
        selectedText: {
            color: theme.colors.onPrimary,
        },
        notSelected: {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.border,
            borderWidth: 0,
        },
    });

    const renderLabel = () => (
        <View style={[
            styles.container,
            selected && styles.selected,
            !selected && styles.notSelected,
            style
        ]}>
            <Text style={[styles.text, selected && styles.selectedText]}>
                {label}
            </Text>
            {removable && (
                <TouchableOpacity
                    style={styles.removeIcon}
                    onPress={handleRemovePress}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <Icon name="x" width={12} height={12} color={selected ? theme.colors.onPrimary : theme.colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );

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

    // Render as touchable if interactive, otherwise as a simple view
    return isInteractive ? (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            disabled={!selectable}
        >
            {renderLabel()}
        </TouchableOpacity>
    ) : renderLabel();
};

export default Label; 