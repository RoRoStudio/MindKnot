/**
 * LabelRow component for displaying labels with smart overflow handling
 * @module components/molecules/LabelRow
 */
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Label, LabelProps } from './Label';

/**
 * Props for the LabelRow component
 */
export interface LabelRowProps {
    /**
     * Array of label strings to display
     */
    labels: string[];

    /**
     * Maximum number of labels to show before showing overflow indicator
     * @default 3
     */
    maxLabelsToShow?: number;

    /**
     * Size variant for all labels
     * @default 'medium'
     */
    size?: LabelProps['size'];

    /**
     * Whether labels are selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether labels are removable
     * @default false
     */
    removable?: boolean;

    /**
     * Callback for when a label is pressed (when selectable)
     */
    onLabelPress?: (label: string, index: number) => void;

    /**
     * Callback for when a label remove is pressed (when removable)
     */
    onLabelRemove?: (label: string, index: number) => void;

    /**
     * Custom gap between labels
     * @default 8
     */
    gap?: number;

    /**
     * Optional additional styles for the container
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Optional style for individual labels
     */
    labelStyle?: StyleProp<ViewStyle>;
}

/**
 * LabelRow component - displays labels in a row with smart overflow handling
 * Shows the first N labels and a "+X" indicator for remaining labels
 */
export const LabelRow: React.FC<LabelRowProps> = ({
    labels,
    maxLabelsToShow = 3,
    size = 'medium',
    selectable = false,
    removable = false,
    onLabelPress,
    onLabelRemove,
    gap = 8,
    style,
    labelStyle,
}) => {
    // If no labels, render nothing
    if (!labels || labels.length === 0) {
        return null;
    }

    // Calculate which labels to show and overflow count
    const shouldShowOverflow = labels.length > maxLabelsToShow;
    const labelsToShow = shouldShowOverflow ? labels.slice(0, maxLabelsToShow - 1) : labels;
    const overflowCount = shouldShowOverflow ? labels.length - labelsToShow.length : 0;

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: gap,
        },
        overflowLabel: {
            backgroundColor: '#F9FAFB', // Even lighter background
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderStyle: 'dashed', // Dashed border to differentiate it
            opacity: 0.8, // Slight transparency to make it more subtle
        },
    });

    const handleLabelPress = (label: string, index: number) => {
        if (selectable && onLabelPress) {
            onLabelPress(label, index);
        }
    };

    const handleLabelRemove = (label: string, index: number) => {
        if (removable && onLabelRemove) {
            onLabelRemove(label, index);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {/* Render visible labels */}
            {labelsToShow.map((label, index) => (
                <Label
                    key={`${label}-${index}`}
                    label={label}
                    size={size}
                    selectable={selectable}
                    removable={removable}
                    onPress={() => handleLabelPress(label, index)}
                    onRemove={() => handleLabelRemove(label, index)}
                    style={labelStyle}
                />
            ))}

            {/* Render overflow indicator if needed */}
            {shouldShowOverflow && (
                <Label
                    label={`+${overflowCount}`}
                    size={size}
                    selectable={false}
                    removable={false}
                    style={[labelStyle, styles.overflowLabel]}
                />
            )}
        </View>
    );
};

export default LabelRow; 