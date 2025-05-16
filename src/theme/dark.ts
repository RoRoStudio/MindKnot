// src/theme/dark.ts
import { ThemeType } from './themeTypes';
import { baseColors, darkColors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const darkTheme: ThemeType = {
    name: 'dark',
    isDark: true,
    colors: {
        // Primary colors - slightly brighter for dark mode
        primary: '#547792',
        primaryLight: '#94B4C1',
        primaryDark: '#213448',
        onPrimary: '#FFFFFF',

        // Secondary colors - slightly darker for dark mode
        secondary: '#C8CCA6',
        secondaryLight: '#ECEFCA',
        secondaryDark: '#A6A980',
        onSecondary: '#213448',
        secondaryContainer: '#3A3D2C',

        // Tertiary colors
        tertiary: '#E99470',
        tertiaryLight: '#FFBB96',
        tertiaryDark: '#C06B3E',
        onTertiary: '#FFFFFF',

        // Accent colors
        accent: '#94B4C1',
        accentLight: '#B5CEDA',
        accentDark: '#6E8C99',
        onAccent: '#FFFFFF',

        // Neutral colors
        background: '#121212',
        surface: '#1E1E1E',
        surfaceVariant: '#2C2C2C',
        error: '#FF6B6B', // Lighter red for dark mode
        warning: '#FFAB4C', // Lighter orange for dark mode
        success: '#4ADE80', // Lighter green for dark mode
        info: '#7DD3FC', // Lighter blue info color for dark mode

        // Text colors
        textPrimary: '#FFFFFF',
        textSecondary: '#B5CEDA', // Lighter version of accentLight
        textDisabled: '#666666',
        textLink: '#94B4C1', // Accent color

        // Border and divider
        border: '#333333',
        divider: '#404040',

        // Shadow color
        shadow: '#000000',

        // Utility colors
        white: baseColors.white,
        black: baseColors.black,
        transparent: 'transparent',
    },

    typography: {
        fontFamily: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
        },
        fontSize: typography.fontSize,
        fontWeight: {
            regular: '400',
            medium: '500',
            bold: '700',
        },
        lineHeight: typography.lineHeight,
    },

    spacing: {
        ...spacing,
        xxl: 48, // Adding an xxl size that was missing
    },

    shape: {
        radius: {
            none: 0,
            xs: 2,
            s: 4,
            m: 8,
            l: 12,
            xl: 20,
            circle: 999,
        },
    },

    elevation: {
        z1: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 2,
            elevation: 1,
        },
        z2: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 2,
        },
        z3: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 5,
            elevation: 6,
        },
        z4: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 8,
            elevation: 10,
        },
    },

    components: {
        bottomNavBar: {
            background: '#213448', // Dark primary
            activeIcon: '#ECEFCA', // Light secondary 
            inactiveIcon: 'rgba(236, 239, 202, 0.7)', // Semi-transparent
            activeText: '#ECEFCA', // Light secondary
            inactiveText: 'rgba(236, 239, 202, 0.7)', // Semi-transparent
            fabBackground: '#94B4C1', // Accent color
            fabIcon: '#213448', // Dark primary for contrast on the accent
            menuItemBackground: '#547792', // Primary
            menuItemIcon: '#FFFFFF',
            elevation: 8,
        },
        card: {
            background: '#1E1E1E',
            border: '#333333',
            titleColor: '#ECEFCA', // Light secondary
            textColor: '#B5CEDA', // Light accent
            radius: 10,
        },
        button: {
            primary: {
                background: '#547792', // Primary (slightly brighter for dark mode)
                text: '#FFFFFF',
                border: 'transparent',
                radius: 10,
            },
            secondary: {
                background: 'transparent',
                text: '#94B4C1', // Accent
                border: '#94B4C1', // Accent
                radius: 10,
            },
            text: {
                color: '#ECEFCA', // Light secondary
                pressedColor: '#C8CCA6', // Secondary
            },
        },
        inputs: {
            background: '#2C2C2C',
            text: '#FFFFFF',
            placeholder: '#666666',
            border: '#333333',
            focusBorder: '#94B4C1', // Accent
            radius: 10,
            error: '#FF6B6B',
            success: '#4ADE80',
        },
    },
};