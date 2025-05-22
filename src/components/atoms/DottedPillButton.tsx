// src/components/atoms/DottedPillButton.tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, IconName } from './Icon';

interface DottedPillButtonProps {
    /**
     * Label text to display
     */
    label?: string;

    /**
     * Icon name for the button
     */
    iconName: IconName;

    /**
     * Whether to show only the icon or icon+label
     * @default false
     */
    iconOnly?: boolean;

    /**
     * Callback when pressed
     */
    onPress?: () => void;

    /**
     * Whether the button is disabled
     * @default false
     */
    disabled?: boolean;
}

/**
 * DottedPillButton component for specialized "add" buttons in the UI
 */
const DottedPillButton: React.FC<DottedPillButtonProps> = ({
    label,
    iconName,
    iconOnly = false,
    onPress,
    disabled = false
}) => {
    const { theme } = useTheme();

    // Create styles with tight constraints
    const styles = StyleSheet.create({
        iconOnlyButton: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border || '#ccc',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 4,
            marginBottom: 4
        },
        labelButton: {
            // Use a fixed minimum width with auto sizing
            minWidth: 32,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border || '#ccc',
            flexDirection: 'row',
            alignItems: 'center',
            // No excessive padding - just enough for content
            paddingLeft: 8,
            paddingRight: 8,
            marginRight: 4,
            marginBottom: 4,
            // Critical: Use content sizing, not flex
            alignSelf: 'flex-start'
        },
        icon: {
            width: 14,
            height: 14,
            marginRight: 6
        },
        text: {
            fontSize: 12,
            color: theme.colors.textPrimary || '#666',
            lineHeight: 14,
            paddingTop: 1,
            includeFontPadding: false,
        }
    });

    if (iconOnly) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                style={styles.iconOnlyButton}
            >
                <Icon
                    name={iconName}
                    width={14}
                    height={14}
                    color={theme.colors.textPrimary || '#666'}
                />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.labelButton}
            onPress={onPress}
            disabled={disabled}
        >
            <Icon
                name={iconName}
                width={14}
                height={14}
                color={theme.colors.textPrimary || '#666'}
                style={styles.icon}
            />

            {label && (
                <Text
                    style={styles.text}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export { DottedPillButton };
export default DottedPillButton;