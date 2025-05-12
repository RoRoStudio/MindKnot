// src/components/common/Button.tsx
import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacityProps,
    View,
} from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Icon, IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface ButtonProps extends TouchableOpacityProps {
    variant?: ButtonVariant;
    label: string;
    isLoading?: boolean;
    leftIcon?: IconName;
    rightIcon?: IconName;
    fullWidth?: boolean;
    small?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    label,
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    fullWidth = false,
    small = false,
    style,
    ...props
}) => {
    const styles = useStyles((theme) => ({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: small ? theme.spacing.s : theme.spacing.m,
            paddingHorizontal: small ? theme.spacing.m : theme.spacing.l,
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
        },
        label: {
            color:
                variant === 'primary'
                    ? theme.components.button.primary.text
                    : variant === 'secondary'
                        ? theme.components.button.secondary.text
                        : theme.components.button.text.color,
            fontSize: small ? theme.typography.fontSize.s : theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            textAlign: 'center',
        },
        icon: {
            marginRight: leftIcon && label ? theme.spacing.s : 0,
            marginLeft: rightIcon && label ? theme.spacing.s : 0,
        },
        loader: {
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

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            disabled={isLoading || disabled}
            activeOpacity={0.7}
            {...props}
        >
            {isLoading && (
                <ActivityIndicator
                    size="small"
                    color={styles.label.color}
                    style={styles.loader}
                />
            )}

            {!isLoading && leftIcon && (
                <View style={styles.icon}>
                    <Icon name={leftIcon} width={18} height={18} color={getIconColor()} />
                </View>
            )}

            <Text style={styles.label}>{label}</Text>

            {!isLoading && rightIcon && (
                <View style={styles.icon}>
                    <Icon name={rightIcon} width={18} height={18} color={getIconColor()} />
                </View>
            )}
        </TouchableOpacity>
    );
};