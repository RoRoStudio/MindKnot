// src/theme/light.ts
import { ThemeType } from './themeTypes';
import { baseColors, lightColors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const lightTheme: ThemeType = {
    name: 'light',
    isDark: false,
    colors: {
        // Primary colors
        primary: '#213448',
        primaryLight: '#547792',
        primaryDark: '#0E1924',
        onPrimary: '#FFFFFF',

        // Secondary colors
        secondary: '#ECEFCA',
        secondaryLight: '#F5F7E2',
        secondaryDark: '#C8CCA6',
        onSecondary: '#213448',

        // Accent colors
        accent: '#94B4C1',
        accentLight: '#B5CEDA',
        accentDark: '#6E8C99',
        onAccent: '#FFFFFF',

        // Neutral colors
        background: lightColors.background,
        surface: lightColors.surface,
        surfaceVariant: '#F8F8F8',
        error: baseColors.urgentRed,
        warning: '#F2994A', // Orange warning color
        success: '#27AE60', // Green success color
        info: '#56CCF2', // Light blue info color

        // Text colors
        textPrimary: '#213448',
        textSecondary: '#547792',
        textDisabled: '#BDBDBD',
        textLink: '#547792',

        // Border and divider
        border: '#ECEFCA',
        divider: '#E9E9E9',

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
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        z2: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 2,
        },
        z3: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
        z4: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
        },
    },

    components: {
        bottomNavBar: {
            background: '#213448', // Updated to match primary color
            activeIcon: '#ECEFCA', // Updated to match secondary color
            inactiveIcon: 'rgba(236, 239, 202, 0.7)', // Semi-transparent secondary
            activeText: '#ECEFCA', // Updated to match secondary
            inactiveText: 'rgba(236, 239, 202, 0.7)', // Semi-transparent secondary
            fabBackground: '#6E8C99', // Updated to accent color
            fabIcon: '#FFFFFF',
            menuItemBackground: '#213448', // Using primary
            menuItemIcon: '#ECEFCA',
            elevation: 8,
        },
        card: {
            background: '#FFFFFF',
            border: '#ECEFCA', // Updated to match secondary color
            titleColor: '#213448', // Updated to match primary
            textColor: '#547792', // Updated to match primaryLight
            radius: 8,
        },
        button: {
            primary: {
                background: '#213448', // Updated to match primary
                text: '#FFFFFF',
                border: 'transparent',
                radius: 8,
            },
            secondary: {
                background: 'transparent',
                text: '#213448', // Updated to match primary
                border: '#213448', // Updated to match primary
                radius: 8,
            },
            text: {
                color: '#213448', // Updated to match primary
                pressedColor: '#547792', // Updated to match primaryLight
            },
        },
        inputs: {
            background: '#FFFFFF',
            text: '#213448', // Updated to match primary
            placeholder: '#BDBDBD',
            border: '#ECEFCA', // Updated to match secondary
            focusBorder: '#213448', // Updated to match primary
            radius: 8,
            error: baseColors.urgentRed,
            success: '#27AE60',
        },
    },
};