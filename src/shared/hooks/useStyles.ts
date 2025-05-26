// src/hooks/useStyles.ts
import { StyleSheet } from 'react-native';
import { useTheme } from '../../app/contexts/ThemeContext';
import { ThemeType } from '../../app/theme/themeTypes';
import { useMemo } from 'react';
import styleConstants from '../../app/theme/styleConstants';
import { useThemedStyles } from './useThemedStyles';

/**
 * @deprecated Use useThemedStyles instead
 * 
 * Custom hook to create styles that are theme-aware
 * This hook is maintained for backward compatibility.
 * New components should use useThemedStyles which provides access to style constants.
 * 
 * @param styleCreator A function that takes the theme and returns a style object
 * @returns The created styles
 * 
 * @example
 * const styles = useStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing.m,
 *   },
 * }));
 */
export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
    styleCreator: (theme: ThemeType) => T
): T {
    return useThemedStyles((theme) => styleCreator(theme));
}

export default useStyles;