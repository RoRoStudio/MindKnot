// src/hooks/useStyles.ts
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeType } from '../theme/themeTypes';

/**
 * Custom hook to create styles that are theme-aware
 * 
 * @param styleCreator A function that takes the theme and returns a style object
 * @returns The created styles
 */
export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
    styleCreator: (theme: ThemeType) => T
): T {
    const { theme } = useTheme();

    // Create and memoize the styles based on the current theme
    return StyleSheet.create(styleCreator(theme));
}