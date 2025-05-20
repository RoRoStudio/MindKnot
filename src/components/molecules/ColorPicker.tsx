import React from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Predefined colors for the color picker
 */
const COLORS = [
    // Blues
    '#2196F3', // Blue
    '#1976D2', // Dark Blue
    '#03A9F4', // Light Blue
    '#0288D1', // Dark Light Blue
    '#00BCD4', // Cyan

    // Greens
    '#4CAF50', // Green
    '#388E3C', // Dark Green
    '#8BC34A', // Light Green
    '#689F38', // Dark Light Green
    '#009688', // Teal

    // Reds and Pinks
    '#F44336', // Red
    '#D32F2F', // Dark Red
    '#E91E63', // Pink
    '#C2185B', // Dark Pink

    // Oranges and Yellows
    '#FF9800', // Orange
    '#F57C00', // Dark Orange
    '#FFC107', // Amber
    '#FFA000', // Dark Amber
    '#FFEB3B', // Yellow

    // Purples
    '#9C27B0', // Purple
    '#7B1FA2', // Dark Purple
    '#673AB7', // Deep Purple
    '#512DA8', // Dark Deep Purple

    // Browns and Grays
    '#795548', // Brown
    '#5D4037', // Dark Brown
    '#607D8B', // Blue Gray
    '#455A64', // Dark Blue Gray
    '#9E9E9E', // Gray
    '#616161', // Dark Gray

    // High contrast colors
    '#000000', // Black
    '#FFFFFF', // White
];

/**
 * Props for the ColorPicker component
 */
export interface ColorPickerProps {
    /**
     * Currently selected color (hex format)
     */
    selectedColor: string;

    /**
     * Function to call when a color is selected
     */
    onSelectColor: (color: string) => void;
}

/**
 * ColorPicker component provides a grid of color options for selection
 */
export const ColorPicker = React.memo<ColorPickerProps>(({
    selectedColor,
    onSelectColor
}) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const colorItemSize = Math.min(Math.max(screenWidth / 6, 40), 54); // Responsive sizing with min/max bounds

    const styles = useStyles((theme) => ({
        container: {
            width: '100%',
        },
        colorsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            marginVertical: theme.spacing.s,
        },
        colorItem: {
            width: colorItemSize,
            height: colorItemSize,
            borderRadius: colorItemSize / 2,
            margin: theme.spacing.xs,
            // Default border
            borderWidth: 1,
            borderColor: theme.colors.border,
            // Add shadow for depth
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            // Center any inner content
            alignItems: 'center',
            justifyContent: 'center',
        },
        colorInner: {
            width: '80%',
            height: '80%',
            borderRadius: (colorItemSize * 0.8) / 2,
        },
        selectedOuterRing: {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
        },
        selectedIndicator: {
            position: 'absolute',
            width: '30%',
            height: '30%',
            borderRadius: (colorItemSize * 0.3) / 2,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
        },
        scrollView: {
            maxHeight: 220,
        },
    }));

    // Helper function to determine if white selected indicator will be visible enough
    const isDarkColor = (hexColor: string) => {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);

        // Calculate perceived brightness using the formula: (R*0.299 + G*0.587 + B*0.114)
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

        // If brightness < 128, color is considered dark
        return brightness < 128;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.colorsGrid}>
                    {COLORS.map((color) => {
                        const isSelected = selectedColor === color;
                        const needsWhiteIndicator = isDarkColor(color);

                        return (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorItem,
                                    isSelected && styles.selectedOuterRing,
                                ]}
                                onPress={() => onSelectColor(color)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.colorInner,
                                        { backgroundColor: color },
                                    ]}
                                />
                                {isSelected && (
                                    <View style={[
                                        styles.selectedIndicator,
                                        {
                                            backgroundColor: needsWhiteIndicator ? '#FFFFFF' : '#333333',
                                            borderColor: needsWhiteIndicator ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
                                        }
                                    ]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}); 