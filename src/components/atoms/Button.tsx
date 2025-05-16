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

/**
 * Button style variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text';

/**
 * Button size variants
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button component props interface
 *
 * @interface ButtonProps
 * @extends {TouchableOpacityProps}
 */
export interface ButtonProps extends TouchableOpacityProps {
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
     * Whether the button is in loading state
     * @default false
     */
    isLoading?: boolean;

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
     * Whether to use a smaller size for the button
     * @default false
     */
    small?: boolean;

    /**
     * The size variant of the button
     * @default 'medium'
     */
    size?: ButtonSize;

    /**
     * Custom style for the button container
     */
    style?: StyleProp<ViewStyle>;

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
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    label,
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    fullWidth = false,
    small = false,
    size = 'medium',
    style,
    labelStyle,
    iconStyle,
    ...props
}) => {
    // Make small prop work with size prop
    const buttonSize = small ? 'small' : size;

    const styles = useThemedStyles((theme, constants) => ({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical:
                buttonSize === 'small' ? theme.spacing.s :
                    buttonSize === 'medium' ? theme.spacing.m :
                        theme.spacing.l,
            paddingHorizontal:
                buttonSize === 'small' ? theme.spacing.m :
                    buttonSize === 'medium' ? theme.spacing.l :
                        theme.spacing.xl,
            borderRadius:
                variant === 'primary'
                    ? theme.components.button.primary.radius
                    : variant === 'secondary'
                        ? theme.components.button.secondary.radius
                        : 0,
            borderWidth: variant === 'secondary' ? 1 : 0,
            backgroundColor:
                variant === 'primary'
                    ? theme.components.button.primary.background
                    : variant === 'secondary'
                        ? theme.components.button.secondary.background
                        : 'transparent',
            borderColor: variant === 'secondary'
                ? theme.components.button.secondary.border
                : 'transparent',
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? '100%' : 'auto',
            minHeight:
                buttonSize === 'small' ? constants.COMPONENT_SIZES.BUTTON.HEIGHT.SMALL :
                    buttonSize === 'medium' ? constants.COMPONENT_SIZES.BUTTON.HEIGHT.MEDIUM :
                        constants.COMPONENT_SIZES.BUTTON.HEIGHT.LARGE,
        },
        label: {
            color:
                variant === 'primary'
                    ? theme.components.button.primary.text
                    : variant === 'secondary'
                        ? theme.components.button.secondary.text
                        : theme.components.button.text.color,
            fontSize:
                buttonSize === 'small' ? theme.typography.fontSize.s :
                    buttonSize === 'medium' ? theme.typography.fontSize.m :
                        theme.typography.fontSize.l,
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
        return buttonSize === 'small' ? 16 : buttonSize === 'medium' ? 18 : 24;
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
            {...props}
        >
            {isLoading && (
                <View style={[styles.loaderContainer, iconStyle]}>
                    <ActivityIndicator
                        size={buttonSize === 'small' ? 'small' : 'small'}
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

export default Button; 