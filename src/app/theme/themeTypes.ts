// src/theme/themeTypes.ts
import { TextStyle } from 'react-native';

// Base color palette definitions - Now focused on neutral + brand + vibrant system
export interface ColorPalette {
    // Primary neutral scale - Cool-toned grays for main UI elements, text, and surfaces
    neutral: {
        25: string;   // Near-white background - primary light surface
        50: string;   // Very light gray - subtle background variation
        75: string;   // Light gray - card backgrounds and dividers
        100: string;  // Light gray - borders and inactive elements
        200: string;  // Medium-light gray - secondary borders
        250: string;  // Medium-light gray - inactive text backgrounds
        300: string;  // Medium gray - placeholder text and secondary icons
        400: string;  // Medium-dark gray - secondary text
        500: string;  // Balanced gray - primary body text
        600: string;  // Dark gray - headings and emphasis
        700: string;  // Dark gray - navigation and strong emphasis
        800: string;  // Very dark gray - primary headings
        900: string;  // Near-black - maximum contrast text
        950: string;  // Deepest neutral - dark mode backgrounds
    };

    // MindKnot Brand Colors - Sophisticated navy + elegant gold
    brand: {
        // Primary Brand - Sophisticated Deep Navy (trust, intelligence, premium)
        primary: {
            50: string;   // Very light navy tint
            100: string;  // Light navy tint  
            200: string;  // Medium-light navy
            300: string;  // Medium navy
            400: string;  // Medium-dark navy
            500: string;  // Base navy
            600: string;  // Brand primary navy
            700: string;  // Deep brand navy
            800: string;  // Very deep navy
            900: string;  // Deepest brand navy - sophisticated and elegant
            950: string;  // Ultra deep navy
        };

        // Secondary Brand - True Elegant Gold (luxury, warmth, sophistication)
        secondary: {
            50: string;   // Very light gold tint
            100: string;  // Light gold tint
            200: string;  // Medium-light gold
            300: string;  // Medium gold
            400: string;  // Medium-dark gold
            500: string;  // Base gold - true elegant gold
            600: string;  // Brand secondary gold - sophisticated
            700: string;  // Deep brand gold
            800: string;  // Very deep gold
            900: string;  // Deepest brand gold
            950: string;  // Ultra deep gold
        };
    };

    // Vibrant functional colors - High-contrast, accessible functional colors
    functional: {
        success: {
            light: string;  // Very light green background - WCAG compliant
            main: string;   // Vibrant emerald green - excellent contrast
            dark: string;   // Deep green - maximum contrast
        };
        warning: {
            light: string;  // Very light amber background - WCAG compliant
            main: string;   // Vibrant amber - excellent visibility
            dark: string;   // Deep amber - high contrast
        };
        error: {
            light: string;  // Very light red background - WCAG compliant
            main: string;   // Vibrant red - strong error indication
            dark: string;   // Deep red - maximum contrast
        };
        info: {
            light: string;  // Very light blue background - WCAG compliant  
            main: string;   // Vibrant blue - clear information color
            dark: string;   // Deep blue - high contrast
        };
    };

    // Semantic mappings for easy access to commonly used colors
    primary: string;        // Maps to brand.primary.900 - main brand color for navigation
    primaryLight: string;   // Maps to brand.primary.700 - lighter brand elements
    primaryDark: string;    // Maps to brand.primary.950 - darker brand elements
    primaryContainer: string; // Maps to brand.primary.100 - light container background
    onPrimary: string;      // Maps to neutral.25 - text/icons on brand backgrounds
    onPrimaryContainer: string; // Maps to brand.primary.900 - text on light container

    secondary: string;      // Maps to brand.secondary.600 - secondary brand actions
    secondaryLight: string; // Maps to brand.secondary.500 - lighter secondary elements
    secondaryDark: string;  // Maps to brand.secondary.700 - darker secondary elements
    onSecondary: string;    // Maps to neutral.25 - text/icons on secondary backgrounds

    // Background and surface colors
    background: string;      // Maps to neutral.25 - primary background
    surface: string;         // Maps to neutral.50 - card and component backgrounds
    surfaceVariant: string;  // Maps to neutral.75 - alternative surface color

    // Text colors for hierarchy
    textPrimary: string;     // Maps to neutral.900 - primary text color
    textSecondary: string;   // Maps to neutral.600 - secondary text color
    textDisabled: string;    // Maps to neutral.400 - disabled text color
    textLink: string;        // Maps to brand.primary.700 - link text color

    // Border and divider colors
    border: string;          // Maps to neutral.200 - primary border color
    divider: string;         // Maps to neutral.100 - divider and separator color

    // Feedback colors - using vibrant functional palette
    error: string;           // Maps to functional.error.main
    errorLight: string;      // Maps to functional.error.light
    errorDark: string;       // Maps to functional.error.dark
    warning: string;         // Maps to functional.warning.main
    warningLight: string;    // Maps to functional.warning.light
    warningDark: string;     // Maps to functional.warning.dark
    success: string;         // Maps to functional.success.main
    successLight: string;    // Maps to functional.success.light
    successDark: string;     // Maps to functional.success.dark
    info: string;           // Maps to functional.info.main
    infoLight: string;      // Maps to functional.info.light
    infoDark: string;       // Maps to functional.info.dark

    // Shadow and overlay colors
    shadow: string;          // Maps to neutral.900 - shadow color
    overlay: string;         // Semi-transparent overlay
    scrim: string;          // Light overlay for modals
    backdrop: string;       // Backdrop for modal/drawer components
    focus: string;          // Brand blue focus indicator

    // Utility colors
    transparent: string;     // Transparent - for invisible elements
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
        background: string;           // Primary neutral for navigation background
        activeIcon: string;           // Warm accent for active icons
        inactiveIcon: string;         // Medium neutral for inactive icons
        activeText: string;           // Warm accent for active text
        inactiveText: string;         // Medium neutral for inactive text
        fabBackground: string;        // Cool accent for floating action button
        fabIcon: string;              // Light neutral for FAB icon
        menuItemBackground: string;   // Neutral surface for menu items
        menuItemIcon: string;         // Dark neutral for menu icons
        elevation: number;
    };

    // Card component
    card: {
        background: string;           // Surface color for card background
        border: string;              // Subtle border color
        titleColor: string;          // Dark neutral for card titles
        textColor: string;           // Medium neutral for card text
        radius: number;
        padding: number;
        elevation: ElevationSystem['s'];
    };

    // Button variants
    button: {
        primary: {
            background: string;       // Primary neutral for main actions
            text: string;            // Light neutral for text on primary
            border: string;          // Transparent or matching background
            radius: number;
            pressedBackground: string; // Slightly darker on press
            disabledBackground: string; // Light neutral for disabled state
            disabledText: string;     // Medium neutral for disabled text
        };
        secondary: {
            background: string;       // Transparent for outline style
            text: string;            // Primary neutral for text
            border: string;          // Primary neutral for border
            radius: number;
            pressedBackground: string; // Subtle background on press
            disabledBackground: string; // Transparent
            disabledText: string;     // Light neutral for disabled text
        };
        text: {
            color: string;           // Primary neutral for text buttons
            pressedColor: string;    // Slightly darker on press
            disabledColor: string;   // Light neutral for disabled
        };
    };

    // Input fields
    inputs: {
        background: string;          // Light surface for input background
        text: string;               // Dark neutral for input text
        placeholder: string;        // Medium neutral for placeholder
        border: string;             // Subtle border color
        focusBorder: string;        // Darker neutral for focus state
        radius: number;
        error: string;              // Error functional color
        success: string;            // Success functional color
        padding: number;
        height: number;
    };

    // List items
    listItem: {
        background: string;         // Surface color for list items
        pressedBackground: string;  // Slightly darker on press
        titleColor: string;         // Dark neutral for titles
        subtitleColor: string;      // Medium neutral for subtitles
        border: string;             // Subtle divider color
        height: number;
    };

    // Modals and sheets
    modal: {
        background: string;         // Surface color for modal content
        overlay: string;            // Semi-transparent overlay
        shadow: ElevationSystem['l'];
        radius: number;
    };

    // Status and feedback indicators
    status: {
        info: {
            background: string;     // Info functional light color
            text: string;          // Info functional dark color
        };
        success: {
            background: string;     // Success functional light color
            text: string;          // Success functional dark color
        };
        warning: {
            background: string;     // Warning functional light color
            text: string;          // Warning functional dark color
        };
        error: {
            background: string;     // Error functional light color
            text: string;          // Error functional dark color
        };
    };
}

// Complete theme definition
export interface ThemeType {
    name: string;
    isDark: boolean;
    dark: boolean; // For StatusBar
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