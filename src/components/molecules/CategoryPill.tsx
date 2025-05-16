import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../atoms/Typography';
import { useStyles } from '../../hooks/useStyles';

/**
 * Props for the CategoryPill component
 */
export interface CategoryPillProps {
    /**
     * Category title to display inside the pill
     */
    title: string;

    /**
     * Color for the pill's border and background (with opacity)
     */
    color: string;

    /**
     * Optional size variant
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Whether the pill is selectable/toggleable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the pill is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Callback for when the pill is pressed (when selectable)
     */
    onPress?: () => void;

    /**
     * Optional additional styles for the container
     */
    style?: any;
}

/**
 * CategoryPill component displays a category label with customizable appearance
 * It can be used as a static label or interactive selection element
 */
export const CategoryPill = React.memo<CategoryPillProps>(({
    title,
    color,
    size = 'medium',
    selectable = false,
    selected = false,
    onPress,
    style,
}) => {
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        pill: {
            borderRadius: theme.shape.radius.xl,
            paddingHorizontal: size === 'small' ? theme.spacing.s : (size === 'medium' ? theme.spacing.m : theme.spacing.l),
            paddingVertical: size === 'small' ? 2 : (size === 'medium' ? 4 : 6),
            borderWidth: 1,
            borderColor: color,
            backgroundColor: selected ? `${color}30` : `${color}15`,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
        },
        dot: {
            width: size === 'small' ? 6 : (size === 'medium' ? 8 : 10),
            height: size === 'small' ? 6 : (size === 'medium' ? 8 : 10),
            borderRadius: size === 'small' ? 3 : (size === 'medium' ? 4 : 5),
            backgroundColor: color,
            marginRight: theme.spacing.xs,
        },
        text: {
            fontSize: size === 'small' ? theme.typography.fontSize.xs :
                (size === 'medium' ? theme.typography.fontSize.s : theme.typography.fontSize.m),
            color: selected ? color : theme.colors.textSecondary,
            fontWeight: selected ? '600' : '400',
        },
    }));

    const Wrapper = selectable ? TouchableOpacity : View;

    return (
        <Wrapper
            style={[styles.pill, style]}
            onPress={selectable ? onPress : undefined}
            disabled={!selectable}
        >
            <View style={styles.dot} />
            <Typography style={styles.text}>
                {title}
            </Typography>
        </Wrapper>
    );
}); 