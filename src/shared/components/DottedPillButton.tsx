// src/components/atoms/DottedPillButton.tsx
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
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
    const styles = useThemedStyles((theme) => ({
        iconOnlyButton: {
            width: 24,
            height: 24,
            borderRadius: theme.shape.radius.pill,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.xxs,
            marginBottom: theme.spacing.xxs,
            opacity: disabled ? theme.opacity.medium : theme.opacity.full,
        },
        labelButton: {
            minWidth: 32,
            height: 24,
            borderRadius: theme.shape.radius.pill,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            marginRight: theme.spacing.xxs,
            marginBottom: theme.spacing.xxs,
            alignSelf: 'flex-start',
            opacity: disabled ? theme.opacity.medium : theme.opacity.full,
        },
        icon: {
            width: 14,
            height: 14,
            marginRight: theme.spacing.xs,
        },
        text: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textPrimary,
            lineHeight: 14,
            paddingTop: 1,
            includeFontPadding: false,
        }
    }));

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
                    color={styles.text.color}
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
                color={styles.text.color}
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