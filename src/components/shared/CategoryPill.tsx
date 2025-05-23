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

    // Calculate background color with opacity for subtle appearance
    const getBackgroundColor = (color: string) => {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return selected ? color : `rgba(${r}, ${g}, ${b}, 0.08)`;
        }
        return selected ? color : `${color}15`; // Fallback with hex alpha
    };

    // Get text color based on selection state
    const getTextColor = (color: string, selected: boolean) => {
        return selected ? theme.colors.onPrimary : theme.colors.textPrimary;
    };

    // Size-based styling
    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: 2,
                    paddingHorizontal: 8,
                    fontSize: 11,
                    dotSize: 5,
                    dotMargin: 4,
                };
            case 'large':
                return {
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    fontSize: 14,
                    dotSize: 8,
                    dotMargin: 8,
                };
            default: // medium
                return {
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                    fontSize: 12,
                    dotSize: 6,
                    dotMargin: 6,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const styles = StyleSheet.create({
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            borderRadius: 100, // Fully rounded
            borderWidth: 1,
            borderColor: selected ? theme.colors.border : color,
            backgroundColor: selected ? theme.colors.surface : getBackgroundColor(color),
            shadowColor: selected ? color : 'transparent',
            shadowOpacity: selected ? 0.2 : 0,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: selected ? 2 : 0,
        },
        dot: {
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            borderRadius: sizeStyles.dotSize / 2,
            backgroundColor: selected ? theme.colors.onPrimary : color,
            marginRight: sizeStyles.dotMargin,
        },
        text: {
            fontSize: sizeStyles.fontSize,
            fontWeight: '500',
            color: getTextColor(color, selected),
            letterSpacing: 0.3,
        },
    });

    const handlePress = () => {
        if (selectable && onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.pill, style]}
            onPress={handlePress}
            disabled={!selectable}
            activeOpacity={selectable ? 0.7 : 1}
            accessibilityRole={selectable ? "button" : "text"}
            accessibilityLabel={`Category: ${title}`}
            accessibilityState={{ selected }}
        >
            <View style={styles.dot} />
            <Text style={styles.text} numberOfLines={1}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CategoryPill; 