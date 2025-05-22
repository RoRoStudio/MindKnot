import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Props for the CategoryPill component
 */
export interface CategoryPillProps {
    /**
     * Category title to display inside the pill
     */
    title: string;

    /**
     * Color for the pill's border and background (with opacity)
     */
    color: string;

    /**
     * Optional size variant
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Whether the pill is selectable/toggleable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the pill is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Callback for when the pill is pressed (when selectable)
     */
    onPress?: () => void;

    /**
     * Optional additional styles for the container
     */
    style?: any;
}

/**
 * CategoryPill component displays a category label with customizable appearance
 * It can be used as a static label or interactive selection element
 */
export const CategoryPill: React.FC<CategoryPillProps> = ({
    title,
    color,
    size = 'medium',
    selectable = false,
    selected = false,
    onPress,
    style,
}) => {
    const { theme } = useTheme();

    // Calculate background color with opacity
    const getBackgroundColor = (color: string) => {
        // Convert hex color to rgba with 0.1 opacity
        // This matches the HTML example: background-color: rgba(59, 130, 246, 0.1)
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        return `${color}10`; // Fallback with hex alpha
    };

    const styles = StyleSheet.create({
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: color,
            backgroundColor: getBackgroundColor(color),
        },
        dot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            marginRight: 6,
        },
        text: {
            fontSize: 12,
            fontWeight: '500',
            color: '#374151',
        },
        selectedPill: {
            backgroundColor: color,
        },
        selectedText: {
            color: '#FFFFFF',
        }
    });

    const handlePress = () => {
        if (selectable && onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.pill,
                selected && styles.selectedPill,
                style
            ]}
            onPress={handlePress}
            disabled={!selectable}
            activeOpacity={selectable ? 0.7 : 1}
        >
            <View style={styles.dot} />
            <Text style={[
                styles.text,
                selected && styles.selectedText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CategoryPill; 