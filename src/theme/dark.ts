// src/theme/dark.ts
import { TextStyle } from 'react-native';
import { ThemeType } from './themeTypes';
import tokens from './tokens';

// Extended color palette with additional colors needed by components
export const extendedColorPalette = {
    ...tokens.color.neutral,
    white: tokens.color.neutral.white,
    black: tokens.color.neutral.black,
    text: tokens.color.neutral.white
};

export const darkTheme: ThemeType = {
    name: 'dark',
    isDark: true,
    dark: true, // Adding this property for StatusBar
    colors: {
        // Extended color palette
        ...extendedColorPalette,

        // Brand color scales
        brand: {
            blue: tokens.color.brand.blue,
            green: tokens.color.brand.green,
            orange: tokens.color.brand.orange,
            teal: tokens.color.brand.teal,
        },

        // Neutral colors
        neutral: tokens.color.neutral,

        // Primary colors (semantic mappings)
        primary: tokens.color.brand.blue[400], // Brighter in dark mode
        primaryLight: tokens.color.brand.teal[200],
        primaryDark: tokens.color.brand.blue[500],
        onPrimary: tokens.color.neutral.white,

        // Secondary colors
        secondary: tokens.color.brand.green[400], // Darker in dark mode
        secondaryLight: tokens.color.brand.green[200],
        secondaryDark: tokens.color.brand.green[500],
        onSecondary: tokens.color.brand.blue[500],
        secondaryContainer: '#3A3D2C', // Custom dark color for container

        // Tertiary colors
        tertiary: tokens.color.brand.orange[200], // Brighter in dark mode
        tertiaryLight: '#FFBB96', // Custom brighter color
        tertiaryDark: tokens.color.brand.orange[400],
        onTertiary: tokens.color.neutral.white,

        // Accent colors
        accent: tokens.color.brand.teal[300],
        accentLight: tokens.color.brand.teal[200],
        accentDark: tokens.color.brand.teal[400],
        onAccent: tokens.color.neutral.white,

        // Background, surface, and content
        background: tokens.color.neutral.gray[950],
        surface: tokens.color.neutral.gray[900],
        surfaceVariant: tokens.color.neutral.gray[800],

        // Text colors
        textPrimary: tokens.color.neutral.white,
        textSecondary: tokens.color.brand.teal[200],
        textDisabled: tokens.color.neutral.gray[600],
        textLink: tokens.color.brand.teal[300],

        // Border and divider
        border: tokens.color.neutral.gray[700],
        divider: tokens.color.neutral.gray[700],

        // Feedback colors - brighter in dark mode
        error: '#FF6B6B',
        errorLight: 'rgba(255, 107, 107, 0.2)',
        errorDark: '#FF3333',
        warning: '#FFAB4C',
        warningLight: 'rgba(255, 171, 76, 0.2)',
        warningDark: '#FF9900',
        success: '#4ADE80',
        successLight: 'rgba(74, 222, 128, 0.2)',
        successDark: '#22C55E',
        info: '#7DD3FC',
        infoLight: 'rgba(125, 211, 252, 0.2)',
        infoDark: '#38BDF8',

        // Shadow color
        shadow: tokens.color.neutral.black,

        // Utility colors
        transparent: 'transparent',
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
                color: tokens.color.neutral.white,
            } as TextStyle,
            heading2: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral.white,
            } as TextStyle,
            heading3: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: "700",
                lineHeight: tokens.typography.fontSize.xl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.neutral.white,
            } as TextStyle,
            heading4: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.l,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.l * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.white,
            } as TextStyle,
            heading5: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.white,
            } as TextStyle,
            heading6: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.white,
            } as TextStyle,
            subtitle1: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.teal[200],
            } as TextStyle,
            subtitle2: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.teal[200],
            } as TextStyle,
            body1: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.gray[300],
            } as TextStyle,
            body2: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.gray[300],
            } as TextStyle,
            caption: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.gray[500],
            } as TextStyle,
            overline: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: "500",
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.wide,
                textTransform: 'uppercase',
                color: tokens.color.neutral.gray[500],
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
                fontWeight: "400",
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.gray[300],
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
            background: tokens.color.brand.blue[500],
            activeIcon: tokens.color.brand.green[200],
            inactiveIcon: `rgba(236, 239, 202, 0.7)`,
            activeText: tokens.color.brand.green[200],
            inactiveText: `rgba(236, 239, 202, 0.7)`,
            fabBackground: tokens.color.brand.teal[300],
            fabIcon: tokens.color.brand.blue[500],
            menuItemBackground: tokens.color.brand.blue[400],
            menuItemIcon: tokens.color.neutral.white,
            elevation: 8,
        },

        card: {
            background: tokens.color.neutral.gray[900],
            border: tokens.color.neutral.gray[700],
            titleColor: tokens.color.brand.green[200],
            textColor: tokens.color.brand.teal[200],
            radius: tokens.radius.m,
            padding: tokens.spacing.m,
            elevation: tokens.shadow.s,
        },

        button: {
            primary: {
                background: tokens.color.brand.blue[400],
                text: tokens.color.neutral.white,
                border: 'transparent',
                radius: tokens.radius.m,
                pressedBackground: tokens.color.brand.blue[300],
                disabledBackground: tokens.color.neutral.gray[800],
                disabledText: tokens.color.neutral.gray[600],
            },
            secondary: {
                background: 'transparent',
                text: tokens.color.brand.teal[300],
                border: tokens.color.brand.teal[300],
                radius: tokens.radius.m,
                pressedBackground: `rgba(148, 180, 193, 0.2)`,
                disabledBackground: 'transparent',
                disabledText: tokens.color.neutral.gray[700],
            },
            text: {
                color: tokens.color.brand.green[200],
                pressedColor: tokens.color.brand.green[300],
                disabledColor: tokens.color.neutral.gray[700],
            },
        },

        inputs: {
            background: tokens.color.neutral.gray[800],
            text: tokens.color.neutral.white,
            placeholder: tokens.color.neutral.gray[600],
            border: tokens.color.neutral.gray[700],
            focusBorder: tokens.color.brand.teal[300],
            radius: tokens.radius.m,
            error: '#FF6B6B',
            success: '#4ADE80',
            padding: tokens.spacing.m,
            height: 56,
        },

        listItem: {
            background: tokens.color.neutral.gray[900],
            pressedBackground: tokens.color.neutral.gray[800],
            titleColor: tokens.color.neutral.white,
            subtitleColor: tokens.color.brand.teal[200],
            border: tokens.color.neutral.gray[700],
            height: 72,
        },

        modal: {
            background: tokens.color.neutral.gray[900],
            overlay: tokens.color.special.overlay,
            shadow: tokens.shadow.l,
            radius: tokens.radius.l,
        },

        status: {
            info: {
                background: 'rgba(125, 211, 252, 0.2)',
                text: '#7DD3FC',
            },
            success: {
                background: 'rgba(74, 222, 128, 0.2)',
                text: '#4ADE80',
            },
            warning: {
                background: 'rgba(255, 171, 76, 0.2)',
                text: '#FFAB4C',
            },
            error: {
                background: 'rgba(255, 107, 107, 0.2)',
                text: '#FF6B6B',
            },
        },
    },
};