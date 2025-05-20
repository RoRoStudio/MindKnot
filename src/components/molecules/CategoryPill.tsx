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
export const CategoryPill: React.FC<CategoryPillProps> = ({
    title,
    color,
    size = 'medium',
    selectable = false,
    selected = false,
    onPress,
    style,
}) => {
    const { theme } = useTheme();

    // Fixed heights for consistent appearance across the app
    const getPillHeight = () => {
        switch (size) {
            case 'small': return 24;
            case 'medium': return 28;
            case 'large': return 32;
            default: return 28;
        }
    };

    const styles = useStyles((theme) => ({
        pill: {
            // Make pills pill-shaped with border radius at half height
            borderRadius: 100, // Very high value ensures pill shape
            paddingHorizontal:
                size === 'small' ? theme.spacing.s :
                    size === 'medium' ? theme.spacing.m :
                        theme.spacing.l,
            paddingVertical:
                size === 'small' ? 2 :
                    size === 'medium' ? 3 :
                        4,
            height: getPillHeight(),
            backgroundColor: `${color}20`, // 20% opacity for background
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            // Add border
            borderWidth: 1,
            borderColor: color,
            // Add shadow for more depth
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        text: {
            fontSize:
                size === 'small' ? theme.typography.fontSize.xs :
                    size === 'medium' ? theme.typography.fontSize.s :
                        theme.typography.fontSize.m,
            color: selected ? color : theme.colors.textPrimary,
            fontWeight: selected ? '500' : '400',
            marginTop: 0,
            marginBottom: 0,
            lineHeight:
                size === 'small' ? 16 :
                    size === 'medium' ? 18 :
                        20,
        },
        dot: {
            width: size === 'small' ? 8 : size === 'medium' ? 10 : 12,
            height: size === 'small' ? 8 : size === 'medium' ? 10 : 12,
            borderRadius: 50,
            backgroundColor: color,
            marginRight: theme.spacing.xs,
        }
    }));

    // Use appropriate wrapper component based on interactivity
    const Wrapper = selectable ? TouchableOpacity : View;

    const handlePress = () => {
        if (selectable && onPress) {
            onPress();
        }
    };

    return (
        <Wrapper
            style={[styles.pill, style]}
            onPress={handlePress}
            disabled={!selectable}
            accessibilityRole={selectable ? "button" : undefined}
            accessibilityState={selectable ? { selected } : undefined}
        >
            <View style={styles.dot} />
            <Typography style={styles.text} numberOfLines={1}>
                {title}
            </Typography>
        </Wrapper>
    );
};

export default CategoryPill; 