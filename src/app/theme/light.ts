// src/theme/light.ts
import { TextStyle } from 'react-native';
import { ThemeType } from './themeTypes';
import tokens from './tokens';

export const lightTheme: ThemeType = {
    name: 'light',
    isDark: false,
    dark: false, // For StatusBar
    colors: {
        // Primary neutral scale - Cool-toned grays for main UI elements, text, and surfaces
        neutral: tokens.color.neutral,

        // MindKnot Brand Colors - Sophisticated navy + elegant gold
        brand: tokens.color.brand,

        // Vibrant functional colors - High-contrast, accessible functional colors
        functional: tokens.color.functional,

        // Semantic mappings for commonly used colors - sophisticated navy + gold
        primary: tokens.color.brand.primary[900],        // Deep sophisticated navy for navigation and primary actions
        primaryLight: tokens.color.brand.primary[700],   // Lighter navy for hover/active states
        primaryDark: tokens.color.brand.primary[950],    // Darkest navy for high contrast
        onPrimary: tokens.color.neutral[25],             // Light text/icons on navy backgrounds

        secondary: tokens.color.brand.secondary[600],    // Sophisticated gold for secondary actions and accents
        secondaryLight: tokens.color.brand.secondary[500], // Lighter elegant gold
        secondaryDark: tokens.color.brand.secondary[700], // Darker elegant gold
        onSecondary: tokens.color.neutral[900],          // Dark text/icons on gold backgrounds (better contrast)

        // Background and surface colors
        background: tokens.color.neutral[25],            // Near-white primary background
        surface: tokens.color.neutral[50],               // Very light gray for card backgrounds
        surfaceVariant: tokens.color.neutral[75],        // Light gray for alternative surfaces

        // Text colors for hierarchy
        textPrimary: tokens.color.neutral[900],          // Near-black for primary text
        textSecondary: tokens.color.neutral[600],        // Dark gray for secondary text
        textDisabled: tokens.color.neutral[400],         // Medium gray for disabled text
        textLink: tokens.color.brand.primary[700],       // Brand blue for link text

        // Border and divider colors
        border: tokens.color.neutral[200],               // Medium-light gray for borders
        divider: tokens.color.neutral[100],              // Light gray for dividers

        // Feedback colors - using vibrant functional palette
        error: tokens.color.functional.error.main,
        errorLight: tokens.color.functional.error.light,
        errorDark: tokens.color.functional.error.dark,
        warning: tokens.color.functional.warning.main,
        warningLight: tokens.color.functional.warning.light,
        warningDark: tokens.color.functional.warning.dark,
        success: tokens.color.functional.success.main,
        successLight: tokens.color.functional.success.light,
        successDark: tokens.color.functional.success.dark,
        info: tokens.color.functional.info.main,
        infoLight: tokens.color.functional.info.light,
        infoDark: tokens.color.functional.info.dark,

        // Shadow and overlay colors
        shadow: tokens.color.neutral[900],               // Dark shadow color
        overlay: tokens.color.special.overlay,           // Semi-transparent overlay
        scrim: tokens.color.special.scrim,               // Light overlay for modals
        backdrop: tokens.color.special.backdrop,         // Backdrop for modal/drawer components
        focus: tokens.color.special.focus,               // Brand blue focus indicator

        // Utility colors
        transparent: 'transparent',                      // Transparent for invisible elements
    },

    typography: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize,
        fontWeight: {
            regular: "400",
            medium: "500",
            semibold: "600",
            bold: "700",
        },
        lineHeight: tokens.typography.lineHeight,
        letterSpacing: tokens.typography.letterSpacing,
        preset: {
            heading1: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxxl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xxxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral[900], // Near-black for maximum contrast
            } as TextStyle,
            heading2: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral[900],
            } as TextStyle,
            heading3: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral[800], // Slightly lighter for hierarchy
            } as TextStyle,
            heading4: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.l,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.l * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[800],
            } as TextStyle,
            heading5: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[700],
            } as TextStyle,
            heading6: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[700],
            } as TextStyle,
            subtitle1: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[600], // Secondary text color
            } as TextStyle,
            subtitle2: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[600],
            } as TextStyle,
            body1: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[500], // Primary body text
            } as TextStyle,
            body2: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[500],
            } as TextStyle,
            caption: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[400], // Lighter for captions
            } as TextStyle,
            overline: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.wide,
                textTransform: 'uppercase',
                color: tokens.color.neutral[400],
            } as TextStyle,
            button: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                textTransform: 'none',
            } as TextStyle,
            label: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[600],
            } as TextStyle,
        },
    },

    spacing: {
        ...tokens.spacing,
    },

    shape: {
        radius: {
            ...tokens.radius,
        },
    },

    elevation: {
        ...tokens.shadow,
    },

    zIndex: {
        ...tokens.zIndex,
    },

    animation: {
        ...tokens.animation,
    },

    opacity: {
        ...tokens.opacity,
    },

    components: {
        bottomNavBar: {
            background: tokens.color.brand.primary[900],     // Deep sophisticated navy for navigation background
            activeIcon: tokens.color.brand.secondary[600],   // Elegant gold for active icons
            inactiveIcon: tokens.color.neutral[400],         // Medium neutral for inactive icons
            activeText: tokens.color.brand.secondary[600],   // Elegant gold for active text
            inactiveText: tokens.color.neutral[400],         // Medium neutral for inactive text
            fabBackground: tokens.color.brand.secondary[600], // Sophisticated gold for floating action button
            fabIcon: tokens.color.neutral[900],              // Dark icon on gold FAB for excellent contrast
            menuItemBackground: tokens.color.neutral[50],    // Light surface for menu items
            menuItemIcon: tokens.color.neutral[700],         // Dark neutral for menu icons
            elevation: 8,
        },

        card: {
            background: tokens.color.neutral[50],            // Light surface for cards
            border: tokens.color.neutral[200],               // Subtle border
            titleColor: tokens.color.neutral[800],           // Dark title text
            textColor: tokens.color.neutral[600],            // Medium text color
            radius: tokens.radius.m,
            padding: tokens.spacing.m,
            elevation: tokens.shadow.s,
        },

        button: {
            primary: {
                background: tokens.color.brand.primary[900],     // Deep brand blue background
                text: tokens.color.neutral[25],                 // Light text on brand background
                border: 'transparent',
                radius: tokens.radius.m,
                pressedBackground: tokens.color.brand.primary[950], // Darker on press
                disabledBackground: tokens.color.neutral[300],   // Light disabled state
                disabledText: tokens.color.neutral[500],         // Medium disabled text
            },
            secondary: {
                background: 'transparent',                       // Transparent outline style
                text: tokens.color.brand.primary[900],          // Brand blue text
                border: tokens.color.brand.primary[900],        // Brand blue border
                radius: tokens.radius.m,
                pressedBackground: tokens.color.brand.primary[50], // Subtle brand press background
                disabledBackground: 'transparent',
                disabledText: tokens.color.neutral[400],         // Light disabled text
            },
            text: {
                color: tokens.color.brand.primary[900],          // Brand blue text button
                pressedColor: tokens.color.brand.primary[950],   // Darker on press
                disabledColor: tokens.color.neutral[400],        // Light disabled
            },
        },

        inputs: {
            background: tokens.color.neutral[25],             // Near-white input background
            text: tokens.color.neutral[900],                  // Dark input text
            placeholder: tokens.color.neutral[400],           // Medium placeholder
            border: tokens.color.neutral[200],                // Subtle border
            focusBorder: tokens.color.brand.primary[700],     // Brand blue focus border
            radius: tokens.radius.m,
            error: tokens.color.functional.error.main,
            success: tokens.color.functional.success.main,
            padding: tokens.spacing.m,
            height: 56,
        },

        listItem: {
            background: tokens.color.neutral[25],             // Light list item background
            pressedBackground: tokens.color.neutral[75],      // Slightly darker on press
            titleColor: tokens.color.neutral[800],            // Dark title
            subtitleColor: tokens.color.neutral[600],         // Medium subtitle
            border: tokens.color.neutral[100],                // Light divider
            height: 72,
        },

        modal: {
            background: tokens.color.neutral[25],             // Light modal background
            overlay: tokens.color.special.overlay,            // Dark overlay
            shadow: tokens.shadow.l,
            radius: tokens.radius.l,
        },

        status: {
            info: {
                background: tokens.color.functional.info.light,
                text: tokens.color.functional.info.dark,
            },
            success: {
                background: tokens.color.functional.success.light,
                text: tokens.color.functional.success.dark,
            },
            warning: {
                background: tokens.color.functional.warning.light,
                text: tokens.color.functional.warning.dark,
            },
            error: {
                background: tokens.color.functional.error.light,
                text: tokens.color.functional.error.dark,
            },
        },
    },
};