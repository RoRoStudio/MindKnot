// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeType } from '../theme/themeTypes';
import { lightTheme } from '../theme/light';
import { darkTheme } from '../theme/dark';

type ThemeContextType = {
    theme: ThemeType;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => { },
    setTheme: () => { },
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
    children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Get the device color scheme
    const colorScheme = useColorScheme();

    // Initialize theme based on device color scheme or default to light
    const [themeName, setThemeName] = useState<'light' | 'dark'>(colorScheme || 'light');

    // Update theme when device color scheme changes
    useEffect(() => {
        if (colorScheme) {
            setThemeName(colorScheme);
        }
    }, [colorScheme]);

    // Get the actual theme object based on the theme name
    const theme = themeName === 'dark' ? darkTheme : lightTheme;

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setThemeName(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Set a specific theme
    const setTheme = (newTheme: 'light' | 'dark') => {
        setThemeName(newTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: themeName === 'dark',
                toggleTheme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};