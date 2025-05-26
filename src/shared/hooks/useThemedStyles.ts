import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../app/contexts/ThemeContext';
import { ThemeType } from '../../app/theme/themeTypes';
import styleConstants from '../../app/theme/styleConstants';

/**
 * A hook that creates memoized styles based on the current theme
 * 
 * @param styleCreator A function that creates styles based on the theme
 * @returns Memoized StyleSheet object
 * 
 * @example
 * const styles = useThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing.m,
 *   },
 *   text: {
 *     ...theme.typography.preset.body1,
 *     color: theme.colors.textPrimary,
 *   },
 * }));
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
    styleCreator: (theme: ThemeType, constants: typeof styleConstants) => T
): T {
    const { theme } = useTheme();

    return useMemo(() => {
        const rawStyles = styleCreator(theme, styleConstants);
        return StyleSheet.create(rawStyles);
    }, [theme, styleCreator]);
}

/**
 * A typed version of useThemedStyles that provides type safety for component props
 * 
 * @param styleCreator A function that creates styles based on the theme and props
 * @returns A function that takes props and returns memoized styles
 * 
 * @example
 * interface ButtonProps {
 *   size: 'small' | 'medium' | 'large';
 *   variant: 'primary' | 'secondary';
 * }
 * 
 * const useButtonStyles = useThemedStylesWithProps<ButtonProps>((theme, props) => ({
 *   button: {
 *     backgroundColor: props.variant === 'primary' ? theme.colors.primary : 'transparent',
 *     padding: props.size === 'small' ? theme.spacing.s : theme.spacing.m,
 *   },
 * }));
 * 
 * // In component:
 * const styles = useButtonStyles({ size: 'medium', variant: 'primary' });
 */
export function useThemedStylesWithProps<P extends object>(
    styleCreator: (theme: ThemeType, props: P, constants: typeof styleConstants) => StyleSheet.NamedStyles<any>
): (props: P) => StyleSheet.NamedStyles<any> {
    const { theme } = useTheme();

    return (props: P) => {
        return useMemo(() => {
            const rawStyles = styleCreator(theme, props, styleConstants);
            return StyleSheet.create(rawStyles);
        }, [theme, props]);
    };
}

/**
 * A hook that returns specific text style presets from the theme
 * 
 * @returns Object containing all typography presets
 * 
 * @example
 * const { heading1, body1 } = useTextPresets();
 * 
 * // Then in JSX:
 * <Text style={heading1}>Title</Text>
 * <Text style={body1}>Content text</Text>
 */
export function useTextPresets() {
    const { theme } = useTheme();
    return useMemo(() => theme.typography.preset, [theme]);
}

/**
 * A hook that returns the current theme colors
 * 
 * @returns Object containing all theme colors
 * 
 * @example
 * const { primary, background, textPrimary } = useThemeColors();
 */
export function useThemeColors() {
    const { theme } = useTheme();
    return useMemo(() => theme.colors, [theme]);
}

/**
 * A hook that returns the current theme spacing values
 * 
 * @returns Object containing all theme spacing values
 * 
 * @example
 * const { s, m, l } = useThemeSpacing();
 */
export function useThemeSpacing() {
    const { theme } = useTheme();
    return useMemo(() => theme.spacing, [theme]);
}

/**
 * A hook that returns component-specific theme values
 * 
 * @returns Object containing component-specific theme values
 * 
 * @example
 * const { card, button } = useComponentThemes();
 */
export function useComponentThemes() {
    const { theme } = useTheme();
    return useMemo(() => theme.components, [theme]);
}

export default useThemedStyles; 