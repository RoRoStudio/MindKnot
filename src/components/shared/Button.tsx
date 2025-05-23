/**
 * Button component for user interactions
 * @module components/atoms/Button
 */
import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacityProps,
    View,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Icon, IconName } from './Icon';
import { StyleProps, DisableableProps, LoadingProps, SizeVariant } from '../shared-props';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Button style variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger' | 'outline';

/**
 * Button size variants
 */
export type ButtonSize = 'small' | 'medium' | 'large' | 'xs';

/**
 * Button component props interface
 */
export interface ButtonProps extends TouchableOpacityProps, StyleProps, DisableableProps, LoadingProps {
    /**
     * The style variant of the button
     * @default 'primary'
     */
    variant?: ButtonVariant;

    /**
     * The text label of the button
     */
    label: string;

    /**
     * Icon to display on the left side of the label
     */
    leftIcon?: IconName;

    /**
     * Icon to display on the right side of the label
     */
    rightIcon?: IconName;

    /**
     * Whether the button should take the full width of its container
     * @default false
     */
    fullWidth?: boolean;

    /**
     * The size variant of the button
     * @default 'medium'
     */
    size?: SizeVariant;

    /**
     * Custom style for the button text
     */
    labelStyle?: StyleProp<TextStyle>;

    /**
     * Custom style for the icon
     */
    iconStyle?: StyleProp<ViewStyle>;
}

/**
 * Button component for user interactions
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <Button label="Submit" onPress={handleSubmit} />
 * 
 * // With variant
 * <Button label="Cancel" variant="secondary" onPress={handleCancel} />
 * 
 * // With icons
 * <Button label="Add Item" leftIcon="plus" onPress={handleAdd} />
 * 
 * // Loading state
 * <Button label="Save" isLoading={isSaving} onPress={handleSave} />
 * 
 * // Full width
 * <Button label="Login" fullWidth onPress={handleLogin} />
 * ```
 */
const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    label,
    leftIcon,
    rightIcon,
    fullWidth = false,
    size = 'medium',
    onPress,
    disabled = false,
    isLoading = false,
    style,
    labelStyle,
    iconStyle,
    ...props
}) => {
    const { theme } = useTheme();

    // Create a safe onPress handler that catches and logs errors
    const handlePress = (event: any) => {
        if (!onPress) return;

        try {
            console.log(`Button "${label}" pressed`);
            onPress(event);
        } catch (error) {
            const errorDetails = error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : {
                message: 'Unknown error',
                stack: 'No stack trace available'
            };
            console.error('Error during onPress:', errorDetails);
            // Re-throw so React's error boundary can catch it
            throw error;
        }
    };

    // Get base styles for the button based on variant and size
    const getButtonStyles = (): StyleProp<ViewStyle> => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
        };

        // Size-based padding
        const sizePadding = {
            xs: { paddingVertical: 8, paddingHorizontal: 12 },
            small: { paddingVertical: 10, paddingHorizontal: 16 },
            medium: { paddingVertical: 16, paddingHorizontal: 20 },
            large: { paddingVertical: 18, paddingHorizontal: 24 },
            xl: { paddingVertical: 20, paddingHorizontal: 32 },
        };

        // Variant-specific styling
        let variantStyle: ViewStyle = {};
        switch (variant) {
            case 'primary':
                variantStyle = {
                    backgroundColor: theme.colors.primary,
                    borderWidth: 0,
                };
                break;
            case 'secondary':
                variantStyle = {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderWidth: 0,
                };
                break;
            case 'outline':
                variantStyle = {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                };
                break;
            case 'text':
                variantStyle = {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                };
                break;
            case 'danger':
                variantStyle = {
                    backgroundColor: theme.colors.error,
                    borderWidth: 0,
                };
                break;
            default:
                break;
        }

        // Disabled styling
        const disabledStyle: ViewStyle = disabled ? {
            opacity: 0.5,
        } : {};

        return [baseStyle, sizePadding[size], variantStyle, disabledStyle];
    };

    // Get text styles for the label based on variant
    const getTextStyles = (): StyleProp<TextStyle> => {
        const baseStyle: TextStyle = {
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
        };

        // Size-based fonts
        const sizeStyle = {
            xs: { fontSize: 12 },
            small: { fontSize: 14 },
            medium: { fontSize: 16 },
            large: { fontSize: 18 },
            xl: { fontSize: 20 },
        };

        // Variant-specific text styling
        let variantStyle: TextStyle = {};
        switch (variant) {
            case 'primary':
                variantStyle = {
                    color: theme.colors.onPrimary,
                };
                break;
            case 'secondary':
                variantStyle = {
                    color: theme.colors.primary,
                };
                break;
            case 'outline':
                variantStyle = {
                    color: theme.colors.primary,
                };
                break;
            case 'text':
                variantStyle = {
                    color: theme.colors.primary,
                };
                break;
            case 'danger':
                variantStyle = {
                    color: theme.colors.onPrimary,
                };
                break;
            default:
                break;
        }

        return [baseStyle, sizeStyle[size], variantStyle];
    };

    const styles = useThemedStyles((theme, constants) => ({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical:
                size === 'small' || size === 'xs' ? theme.spacing.s :
                    size === 'medium' ? theme.spacing.m :
                        theme.spacing.l,
            paddingHorizontal:
                size === 'small' || size === 'xs' ? theme.spacing.m :
                    size === 'medium' ? theme.spacing.l :
                        theme.spacing.xl,
            borderRadius:
                variant === 'primary' || variant === 'danger'
                    ? theme.components.button.primary.radius
                    : variant === 'secondary' || variant === 'outline'
                        ? theme.components.button.secondary.radius
                        : 0,
            borderWidth: (variant === 'secondary' || variant === 'outline') ? 1 : 0,
            backgroundColor:
                variant === 'primary'
                    ? theme.components.button.primary.background
                    : variant === 'secondary'
                        ? theme.components.button.secondary.background
                        : variant === 'danger'
                            ? theme.colors.error
                            : 'transparent',
            borderColor:
                variant === 'secondary'
                    ? theme.components.button.secondary.border
                    : variant === 'outline'
                        ? theme.components.button.primary.background
                        : 'transparent',
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? '100%' : 'auto',
            minHeight:
                size === 'xs' ? 32 :
                    size === 'small' ? constants.COMPONENT_SIZES.BUTTON.HEIGHT.SMALL :
                        size === 'medium' ? constants.COMPONENT_SIZES.BUTTON.HEIGHT.MEDIUM :
                            size === 'large' ? constants.COMPONENT_SIZES.BUTTON.HEIGHT.LARGE :
                                70, // xl
        },
        label: {
            color:
                variant === 'primary' || variant === 'danger'
                    ? theme.components.button.primary.text
                    : variant === 'secondary'
                        ? theme.components.button.secondary.text
                        : variant === 'outline'
                            ? theme.components.button.primary.background
                            : theme.components.button.text.color,
            fontSize:
                size === 'xs' ? theme.typography.fontSize.xs :
                    size === 'small' ? theme.typography.fontSize.s :
                        size === 'medium' ? theme.typography.fontSize.m :
                            size === 'large' ? theme.typography.fontSize.l :
                                theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.medium,
            textAlign: 'center',
        },
        leftIconContainer: {
            marginRight: label ? theme.spacing.s : 0,
        },
        rightIconContainer: {
            marginLeft: label ? theme.spacing.s : 0,
        },
        loaderContainer: {
            marginRight: label ? theme.spacing.s : 0,
        },
    }));

    const getIconColor = () => {
        if (variant === 'primary') {
            return styles.label.color;
        } else if (variant === 'secondary') {
            return styles.label.color;
        } else {
            return styles.label.color;
        }
    };

    const getIconSize = () => {
        return size === 'small' ? 16 : size === 'medium' ? 18 : 24;
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            disabled={isLoading || disabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{
                disabled: isLoading || disabled,
                busy: isLoading
            }}
            onPress={handlePress}
            {...props}
        >
            {isLoading && (
                <View style={[styles.loaderContainer, iconStyle]}>
                    <ActivityIndicator
                        size={size === 'small' ? 'small' : 'small'}
                        color={styles.label.color.toString()}
                    />
                </View>
            )}

            {!isLoading && leftIcon && (
                <View style={[styles.leftIconContainer, iconStyle]}>
                    <Icon name={leftIcon} size={getIconSize()} color={getIconColor()} />
                </View>
            )}

            <Text style={[styles.label, labelStyle]}>{label}</Text>

            {!isLoading && rightIcon && (
                <View style={[styles.rightIconContainer, iconStyle]}>
                    <Icon name={rightIcon} size={getIconSize()} color={getIconColor()} />
                </View>
            )}
        </TouchableOpacity>
    );
};

export { Button };
export default Button; 