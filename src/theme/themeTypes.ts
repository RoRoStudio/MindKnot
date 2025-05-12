// src/theme/themeTypes.ts
import { TextStyle } from 'react-native';

// Base color palette definitions
export interface ColorPalette {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    onPrimary: string;

    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    onSecondary: string;

    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;
    onAccent: string;

    // Neutral colors
    background: string;
    surface: string;
    surfaceVariant: string;
    error: string;
    warning: string;
    success: string;
    info: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textLink: string;

    // Border and divider
    border: string;
    divider: string;

    // Utility colors
    white: string;
    black: string;
    transparent: string;
}

// Typography definitions
export interface TypographySystem {
    fontFamily: {
        regular: string;
        medium: string;
        bold: string;
    };
    fontSize: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        xxl: number;
    };
    fontWeight: {
        regular: TextStyle['fontWeight'];
        medium: TextStyle['fontWeight'];
        bold: TextStyle['fontWeight'];
    };
    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };
}

// Spacing definitions
export interface SpacingSystem {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
}

// Shape/radius definitions
export interface ShapeSystem {
    radius: {
        none: number;
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        circle: number;
    };
}

// Elevation/shadow definitions
export interface ElevationSystem {
    z1: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    z2: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    z3: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    z4: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
}

// Component-specific theme properties
export interface ComponentTheme {
    bottomNavBar: {
        background: string;
        activeIcon: string;
        inactiveIcon: string;
        activeText: string;
        inactiveText: string;
        fabBackground: string;
        fabIcon: string;
        menuItemBackground: string;
        menuItemIcon: string;
        elevation: number;
    };
    card: {
        background: string;
        border: string;
        titleColor: string;
        textColor: string;
        radius: number;
    };
    button: {
        primary: {
            background: string;
            text: string;
            border: string;
            radius: number;
        };
        secondary: {
            background: string;
            text: string;
            border: string;
            radius: number;
        };
        text: {
            color: string;
            pressedColor: string;
        };
    };
    inputs: {
        background: string;
        text: string;
        placeholder: string;
        border: string;
        focusBorder: string;
        radius: number;
        error: string;
        success: string;
    };
}

// Complete theme definition
export interface ThemeType {
    name: string;
    isDark: boolean;
    colors: ColorPalette;
    typography: TypographySystem;
    spacing: SpacingSystem;
    shape: ShapeSystem;
    elevation: ElevationSystem;
    components: ComponentTheme;

    // Additional theme values can be added here
}