// src/theme/themeTypes.ts
import { TextStyle } from 'react-native';

// Base color palette definitions
export interface ColorPalette {
    // Brand color scales
    brand: {
        blue: {
            50: string;
            100: string;
            200: string;
            300: string;
            400: string; // primaryLight
            500: string; // primary
            600: string;
            700: string; // primaryDark
            800: string;
            900: string;
        };
        green: {
            50: string;
            100: string; // secondaryContainer
            200: string; // secondary
            300: string;
            400: string; // secondaryDark
            500: string;
            600: string;
            700: string;
            800: string;
            900: string;
        };
        orange: {
            50: string;
            100: string;
            200: string; // tertiaryLight
            300: string;
            400: string; // tertiary
            500: string; // tertiaryDark
            600: string;
            700: string;
            800: string;
            900: string;
        };
        teal: {
            50: string;
            100: string;
            200: string; // accentLight
            300: string; // accent
            400: string; // accentDark
            500: string;
            600: string;
            700: string;
            800: string;
            900: string;
        };
    };

    // Neutral colors (grayscale)
    neutral: {
        white: string;
        gray: {
            50: string;
            100: string;
            200: string;
            300: string;
            400: string;
            500: string;
            600: string;
            700: string;
            800: string;
            900: string;
            950: string;
        };
        black: string;
    };

    // Semantic mappings (references to color scales)
    primary: string;
    primaryLight: string;
    primaryDark: string;
    onPrimary: string;

    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    onSecondary: string;
    secondaryContainer: string;

    tertiary: string;
    tertiaryLight: string;
    tertiaryDark: string;
    onTertiary: string;

    accent: string;
    accentLight: string;
    accentDark: string;
    onAccent: string;

    // Background, surface, and content colors
    background: string;
    surface: string;
    surfaceVariant: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textLink: string;

    // Border and divider
    border: string;
    divider: string;

    // Feedback colors
    error: string;
    errorLight: string;
    errorDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    success: string;
    successLight: string;
    successDark: string;
    info: string;
    infoLight: string;
    infoDark: string;

    // Shadow color
    shadow: string;

    // Utility colors
    transparent: string;
}

// Typography definitions
export interface TypographySystem {
    // Font families
    fontFamily: {
        regular: string;
        medium: string;
        bold: string;
    };

    // Font sizes
    fontSize: {
        xxs: number;
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        xxl: number;
        xxxl: number;
    };

    // Font weights
    fontWeight: {
        regular: TextStyle['fontWeight'];
        medium: TextStyle['fontWeight'];
        semibold: TextStyle['fontWeight'];
        bold: TextStyle['fontWeight'];
    };

    // Line heights
    lineHeight: {
        tight: number;  // For headings (1.15)
        normal: number; // For body text (1.4)
        relaxed: number; // For readable text blocks (1.6)
    };

    // Letter spacing
    letterSpacing: {
        tight: number;
        normal: number;
        wide: number;
    };

    // Preset text styles
    preset: {
        heading1: TextStyle;
        heading2: TextStyle;
        heading3: TextStyle;
        heading4: TextStyle;
        heading5: TextStyle;
        heading6: TextStyle;
        subtitle1: TextStyle;
        subtitle2: TextStyle;
        body1: TextStyle;
        body2: TextStyle;
        caption: TextStyle;
        overline: TextStyle;
        button: TextStyle;
        label: TextStyle;
    };
}

// Spacing definitions
export interface SpacingSystem {
    none: number;
    xxs: number;
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
    xxxl: number;

    // Named functional spacing
    screenPadding: number;
    contentGutter: number;
    cardPadding: number;
    sectionSpacing: number;
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
        xxl: number;
        pill: number;
        circle: number | string;
    };
}

// Elevation/shadow definitions
export interface ElevationSystem {
    none: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    xs: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    s: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    m: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    l: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    xl: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
}

// Z-index system for managing component stacking
export interface ZIndexSystem {
    base: number;
    raised: number;
    dropdown: number;
    sticky: number;
    overlay: number;
    modal: number;
    toast: number;
    tooltip: number;
}

// Animation system
export interface AnimationSystem {
    duration: {
        instant: number;
        fast: number;
        normal: number;
        slow: number;
        deliberate: number;
    };
    easing: {
        standard: string;
        decelerate: string;
        accelerate: string;
        sharp: string;
    };
}

// Opacity system
export interface OpacitySystem {
    none: number;
    low: number;
    medium: number;
    high: number;
    full: number;
}

// Component-specific theme properties
export interface ComponentTheme {
    // Navigation components
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

    // Card component
    card: {
        background: string;
        border: string;
        titleColor: string;
        textColor: string;
        radius: number;
        padding: number;
        elevation: typeof ElevationSystem.prototype.s;
    };

    // Button variants
    button: {
        primary: {
            background: string;
            text: string;
            border: string;
            radius: number;
            pressedBackground: string;
            disabledBackground: string;
            disabledText: string;
        };
        secondary: {
            background: string;
            text: string;
            border: string;
            radius: number;
            pressedBackground: string;
            disabledBackground: string;
            disabledText: string;
        };
        text: {
            color: string;
            pressedColor: string;
            disabledColor: string;
        };
    };

    // Input fields
    inputs: {
        background: string;
        text: string;
        placeholder: string;
        border: string;
        focusBorder: string;
        radius: number;
        error: string;
        success: string;
        padding: number;
        height: number;
    };

    // List items
    listItem: {
        background: string;
        pressedBackground: string;
        titleColor: string;
        subtitleColor: string;
        border: string;
        height: number;
    };

    // Modals and sheets
    modal: {
        background: string;
        overlay: string;
        shadow: typeof ElevationSystem.prototype.l;
        radius: number;
    };

    // Status and feedback indicators
    status: {
        info: {
            background: string;
            text: string;
        };
        success: {
            background: string;
            text: string;
        };
        warning: {
            background: string;
            text: string;
        };
        error: {
            background: string;
            text: string;
        };
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
    zIndex: ZIndexSystem;
    animation: AnimationSystem;
    opacity: OpacitySystem;
}