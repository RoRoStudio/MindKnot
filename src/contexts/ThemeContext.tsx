// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeType } from '../theme/themeTypes';
import { lightTheme } from '../theme/light';
import { darkTheme } from '../theme/dark';

// Storage key for theme preference
const THEME_PREFERENCE_KEY = '@MindKnot:themePreference';

// Theme preference options
type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextType = {
    // Current theme object
    theme: ThemeType;
    // Whether current theme is dark
    isDark: boolean;
    // Toggle between light and dark
    toggleTheme: () => void;
    // Set specific theme
    setTheme: (theme: 'light' | 'dark') => void;
    // Current theme preference (light, dark, or system)
    themePreference: ThemePreference;
    // Set theme preference
    setThemePreference: (preference: ThemePreference) => void;
    // Get color based on current theme mode
    getThemedColor: (lightColor: string, darkColor: string) => string;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => { },
    setTheme: () => { },
    themePreference: 'system',
    setThemePreference: () => { },
    getThemedColor: () => '',
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
    children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Get the device color scheme
    const colorScheme = useColorScheme();

    // State for theme preference (light, dark, or system)
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

    // Derived state for the actual theme name based on preference
    const themeName = useMemo(() => {
        if (themePreference === 'system') {
            return colorScheme || 'light';
        }
        return themePreference;
    }, [themePreference, colorScheme]);

    // Load saved theme preference from storage on mount
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
                if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
                    setThemePreferenceState(savedPreference as ThemePreference);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }
        };

        loadThemePreference();
    }, []);

    // Save theme preference when it changes
    const setThemePreference = async (preference: ThemePreference) => {
        try {
            await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
            setThemePreferenceState(preference);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    // Get the actual theme object based on the theme name
    const theme = themeName === 'dark' ? darkTheme : lightTheme;

    // Toggle between light and dark themes
    const toggleTheme = () => {
        const newTheme = themeName === 'light' ? 'dark' : 'light';
        setThemePreference(newTheme);
    };

    // Set a specific theme
    const setTheme = (newTheme: 'light' | 'dark') => {
        setThemePreference(newTheme);
    };

    // Helper function to get color based on theme mode
    const getThemedColor = (lightColor: string, darkColor: string): string => {
        return themeName === 'dark' ? darkColor : lightColor;
    };

    // Set up listener for system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            // Only update if using system preference
            if (themePreference === 'system') {
                // No need to update state here as the `themeName` memo will handle it
                // when colorScheme changes
            }
        });

        return () => {
            subscription.remove();
        };
    }, [themePreference]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: themeName === 'dark',
                toggleTheme,
                setTheme,
                themePreference,
                setThemePreference,
                getThemedColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};