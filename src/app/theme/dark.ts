// src/theme/dark.ts
import { TextStyle } from 'react-native';
import { ThemeType } from './themeTypes';
import tokens from './tokens';

export const darkTheme: ThemeType = {
    name: 'dark',
    isDark: true,
    dark: true, // For StatusBar
    colors: {
        // Primary neutral scale - Cool-toned grays for main UI elements, text, and surfaces
        neutral: tokens.color.neutral,

        // MindKnot Brand Colors - Sophisticated navy + elegant gold
        brand: tokens.color.brand,

        // Vibrant functional colors - High-contrast, accessible functional colors
        functional: tokens.color.functional,

        // Semantic mappings for commonly used colors - adapted for dark mode with navy + gold
        primary: tokens.color.brand.primary[400],        // Lighter navy for dark mode primary actions
        primaryLight: tokens.color.brand.primary[300],   // Even lighter for hover states
        primaryDark: tokens.color.brand.primary[500],    // Slightly darker for contrast
        primaryContainer: tokens.color.brand.primary[800], // Dark navy container background
        onPrimary: tokens.color.neutral[900],            // Dark text/icons on light brand backgrounds
        onPrimaryContainer: tokens.color.neutral[100],  // Light text on dark navy container

        secondary: tokens.color.brand.secondary[500],    // Lighter elegant gold for dark mode
        secondaryLight: tokens.color.brand.secondary[400], // Lighter gold elements
        secondaryDark: tokens.color.brand.secondary[600], // Darker gold elements
        onSecondary: tokens.color.neutral[900],          // Dark text/icons on gold backgrounds

        // Background and surface colors - dark mode
        background: tokens.color.neutral[950],           // Deepest neutral for dark background
        surface: tokens.color.neutral[900],              // Very dark gray for card backgrounds
        surfaceVariant: tokens.color.neutral[800],       // Dark gray for alternative surfaces

        // Text colors for hierarchy - inverted for dark mode
        textPrimary: tokens.color.neutral[50],           // Very light for primary text
        textSecondary: tokens.color.neutral[300],        // Medium light for secondary text
        textDisabled: tokens.color.neutral[600],         // Medium dark for disabled text
        textLink: tokens.color.brand.primary[300],       // Light brand blue for link text

        // Border and divider colors - darker for dark mode
        border: tokens.color.neutral[700],               // Dark gray for borders
        divider: tokens.color.neutral[800],              // Very dark gray for dividers

        // Feedback colors - using vibrant functional palette (same colors work in dark mode)
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
        shadow: tokens.color.neutral[950],               // Deepest shadow for dark mode
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

        // Preset text styles for dark mode
        preset: {
            heading1: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxxl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xxxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral[50], // Very light for maximum contrast in dark mode
            } as TextStyle,
            heading2: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral[50],
            } as TextStyle,
            heading3: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral[75], // Slightly darker for hierarchy
            } as TextStyle,
            heading4: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.l,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.l * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[75],
            } as TextStyle,
            heading5: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[100],
            } as TextStyle,
            heading6: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[100],
            } as TextStyle,
            subtitle1: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[200], // Light for secondary text
            } as TextStyle,
            subtitle2: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[200],
            } as TextStyle,
            body1: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[300], // Primary body text in dark mode
            } as TextStyle,
            body2: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[300],
            } as TextStyle,
            caption: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral[400], // Darker for captions in dark mode
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
                color: tokens.color.neutral[200],
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
            background: tokens.color.neutral[800],                 // Dark neutral for navigation background
            activeIcon: tokens.color.brand.secondary[500],         // Elegant gold for active icons
            inactiveIcon: tokens.color.neutral[500],               // Medium neutral for inactive icons
            activeText: tokens.color.brand.secondary[500],         // Elegant gold for active text
            inactiveText: tokens.color.neutral[500],               // Medium neutral for inactive text
            fabBackground: tokens.color.brand.secondary[600],      // Rich sophisticated gold for FAB in dark mode
            fabIcon: tokens.color.neutral[900],                    // Dark icon on gold FAB
            menuItemBackground: tokens.color.neutral[800],         // Dark surface for menu items
            menuItemIcon: tokens.color.neutral[200],               // Light icons in menu
            elevation: 8,
        },

        card: {
            background: tokens.color.neutral[900],                 // Dark surface for cards
            border: tokens.color.neutral[700],                     // Dark border
            titleColor: tokens.color.neutral[100],                 // Light title text
            textColor: tokens.color.neutral[300],                  // Medium light text color
            radius: tokens.radius.m,
            padding: tokens.spacing.m,
            elevation: tokens.shadow.s,
        },

        button: {
            primary: {
                background: tokens.color.brand.primary[400],           // Light brand blue for contrast in dark mode
                text: tokens.color.neutral[900],                       // Dark text on light background
                border: 'transparent',
                radius: tokens.radius.m,
                pressedBackground: tokens.color.brand.primary[300],    // Lighter on press
                disabledBackground: tokens.color.neutral[700],         // Dark disabled state
                disabledText: tokens.color.neutral[500],               // Medium disabled text
            },
            secondary: {
                background: 'transparent',                             // Transparent outline style
                text: tokens.color.brand.primary[300],                 // Light brand blue text
                border: tokens.color.brand.primary[400],               // Light brand blue border
                radius: tokens.radius.m,
                pressedBackground: tokens.color.neutral[800],          // Subtle dark press background
                disabledBackground: 'transparent',
                disabledText: tokens.color.neutral[600],               // Dark disabled text
            },
            text: {
                color: tokens.color.brand.primary[300],                // Light brand blue text button
                pressedColor: tokens.color.brand.primary[200],         // Lighter on press
                disabledColor: tokens.color.neutral[600],              // Dark disabled
            },
        },

        inputs: {
            background: tokens.color.neutral[800],                 // Dark input background
            text: tokens.color.neutral[100],                       // Light input text
            placeholder: tokens.color.neutral[500],                // Medium placeholder
            border: tokens.color.neutral[700],                     // Dark border
            focusBorder: tokens.color.brand.primary[400],          // Light brand blue focus border
            radius: tokens.radius.m,
            error: tokens.color.functional.error.main,
            success: tokens.color.functional.success.main,
            padding: tokens.spacing.m,
            height: 56,
        },

        listItem: {
            background: tokens.color.neutral[900],                 // Dark list item background
            pressedBackground: tokens.color.neutral[800],          // Darker on press
            titleColor: tokens.color.neutral[100],                 // Light title
            subtitleColor: tokens.color.neutral[300],              // Medium light subtitle
            border: tokens.color.neutral[800],                     // Dark divider
            height: 72,
        },

        modal: {
            background: tokens.color.neutral[900],                 // Dark modal background
            overlay: tokens.color.special.overlay,                 // Dark overlay (same as light)
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