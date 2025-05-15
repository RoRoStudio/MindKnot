// src/components/common/ColorPicker.tsx
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useStyles } from '../../hooks/useStyles';

// Predefined colors
const COLORS = [
    '#4A90E2', // Blue
    '#50E3C2', // Teal
    '#F5A623', // Orange
    '#D0021B', // Red
    '#9013FE', // Purple
    '#417505', // Green
    '#8B572A', // Brown
    '#F8E71C', // Yellow
    '#7ED321', // Lime
    '#9B9B9B', // Gray
    '#000000', // Black
    '#E91E63', // Pink
    '#9C27B0', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Light Blue
    '#00BCD4', // Cyan
    '#009688', // Dark Teal
    '#4CAF50', // Light Green
    '#FF9800', // Light Orange
    '#795548', // Coffee
];

interface ColorPickerProps {
    selectedColor: string;
    onSelectColor: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
    const styles = useStyles((theme) => ({
        container: {
            width: '100%',
        },
        colorsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: theme.spacing.s,
        },
        colorItem: {
            width: 48,
            height: 48,
            borderRadius: 24,
            margin: theme.spacing.xs,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        selectedColorItem: {
            borderColor: theme.colors.primary,
        },
        scrollView: {
            maxHeight: 200,
        },
    }));

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.colorsContainer}>
                    {COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorItem,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedColorItem,
                            ]}
                            onPress={() => onSelectColor(color)}
                            activeOpacity={0.7}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};