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
import { Icon, IconName } from '../common';
import { StyleProps, DisableableProps, LoadingProps, SizeVariant } from '../shared-props';

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
export const Button = React.memo<ButtonProps>(({
    variant = 'primary',
    label,
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled = false,
    fullWidth = false,
    size = 'medium',
    style,
    labelStyle,
    iconStyle,
    ...props
}) => {
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
});

export default Button; 