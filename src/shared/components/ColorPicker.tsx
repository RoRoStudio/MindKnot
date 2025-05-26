import React from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTheme } from '../../app/contexts/ThemeContext';

/**
 * Predefined colors for the color picker
 */
const PRESET_COLORS = [
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

    // High contrast
    '#000000', // Black
    '#FFFFFF', // White
    // Additional colors
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#9E9E9E', // Grey
    '#E040FB', // Purple A200
    '#7C4DFF', // Deep Purple A200
    '#536DFE', // Indigo A200
    '#448AFF', // Blue A200
    '#40C4FF', // Light Blue A200
    '#18FFFF', // Cyan A200
    '#64FFDA', // Teal A200
    '#69F0AE', // Green A200
    '#B2FF59', // Light Green A200
    '#EEFF41', // Lime A200
    '#FFFF00', // Yellow A200
    '#FFD740', // Amber A200
    '#FFAB40', // Orange A200
    '#FF6E40', // Deep Orange A200
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
    onColorSelected: (color: string) => void;

    /**
     * Optional style for the container
     */
    style?: StyleProp<ViewStyle>;
}

/**
 * ColorPicker component provides a grid of preset colors for selection
 */
const ColorPicker = React.memo<ColorPickerProps>(({
    selectedColor,
    onColorSelected,
    style
}) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const colorItemSize = Math.min(Math.max(screenWidth / 8, 30), 40);

    // Calculate how many colors per row based on available width
    const colorsPerRow = Math.floor((screenWidth - 32) / (colorItemSize + 8)); // 32px for container padding

    // Calculate grid height to ensure it's scrollable
    const totalRows = Math.ceil(PRESET_COLORS.length / colorsPerRow);
    const minGridHeight = Math.min(totalRows * (colorItemSize + 8), 200); // Limit max height

    const styles = useThemedStyles((theme) => ({
        container: {
            width: '100%',
            height: minGridHeight,
            marginVertical: 8,
            minHeight: 240, // Ensure enough space to display colors
            backgroundColor: theme.colors.background,
        },
        scrollView: {
            width: '100%',
            flexGrow: 1,
        },
        colorsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '100%',
            paddingTop: 4,
            paddingBottom: 12,
        },
        colorItem: {
            width: colorItemSize,
            height: colorItemSize,
            borderRadius: colorItemSize / 2,
            margin: theme.spacing.xs,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
        },
        selectedIndicator: {
            width: '35%',
            height: '35%',
            borderRadius: theme.shape.radius.pill,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.isDark ? '#fff' : '#000',
        }
    }));

    // Log for debugging purposes
    console.log('ColorPicker render', {
        availableWidth: screenWidth,
        colorItemSize,
        colorsPerRow,
        totalColors: PRESET_COLORS.length,
        estimatedRows: totalRows,
        containerHeight: minGridHeight
    });

    return (
        <View style={[styles.container, style]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.colorsContainer}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                persistentScrollbar={true}
            >
                {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.colorItem,
                            { backgroundColor: color }
                        ]}
                        onPress={() => onColorSelected(color)}
                        activeOpacity={0.7}
                    >
                        {selectedColor === color && (
                            <View style={styles.selectedIndicator} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
});

export default ColorPicker; 