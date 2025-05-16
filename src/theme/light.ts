// src/theme/light.ts
import { TextStyle } from 'react-native';
import { ThemeType } from './themeTypes';
import tokens from './tokens';

export const lightTheme: ThemeType = {
    name: 'light',
    isDark: false,
    colors: {
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
        primary: tokens.color.brand.blue[500],
        primaryLight: tokens.color.brand.blue[400],
        primaryDark: tokens.color.brand.blue[700],
        onPrimary: tokens.color.neutral.white,

        // Secondary colors
        secondary: tokens.color.brand.green[200],
        secondaryLight: tokens.color.brand.green[100],
        secondaryDark: tokens.color.brand.green[400],
        onSecondary: tokens.color.brand.blue[500],
        secondaryContainer: tokens.color.brand.green[100],

        // Tertiary colors
        tertiary: tokens.color.brand.orange[400],
        tertiaryLight: tokens.color.brand.orange[200],
        tertiaryDark: tokens.color.brand.orange[500],
        onTertiary: tokens.color.neutral.white,

        // Accent colors
        accent: tokens.color.brand.teal[300],
        accentLight: tokens.color.brand.teal[200],
        accentDark: tokens.color.brand.teal[400],
        onAccent: tokens.color.neutral.white,

        // Background, surface, and content
        background: tokens.color.neutral.white,
        surface: tokens.color.neutral.gray[100],
        surfaceVariant: tokens.color.neutral.gray[50],

        // Text colors
        textPrimary: tokens.color.brand.blue[500],
        textSecondary: tokens.color.brand.blue[400],
        textDisabled: tokens.color.neutral.gray[400],
        textLink: tokens.color.brand.blue[400],

        // Border and divider
        border: tokens.color.brand.green[200],
        divider: '#E9E9E9',

        // Feedback colors
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

        // Shadow color
        shadow: 'rgba(0, 0, 0, 0.15)',

        // Utility colors
        transparent: 'transparent',
    },

    typography: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize,
        fontWeight: tokens.typography.fontWeight,
        lineHeight: tokens.typography.lineHeight,
        letterSpacing: tokens.typography.letterSpacing,

        // Preset text styles
        preset: {
            heading1: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxxl,
                fontWeight: tokens.typography.fontWeight.bold,
                lineHeight: tokens.typography.fontSize.xxxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            heading2: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xxl,
                fontWeight: tokens.typography.fontWeight.bold,
                lineHeight: tokens.typography.fontSize.xxl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            heading3: {
                fontFamily: tokens.typography.fontFamily.bold,
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                lineHeight: tokens.typography.fontSize.xl * 1.2,
                letterSpacing: tokens.typography.letterSpacing.tight,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            heading4: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.l,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.l * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            heading5: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.m * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            heading6: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.s * 1.3,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            subtitle1: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[400],
            } as TextStyle,
            subtitle2: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[400],
            } as TextStyle,
            body1: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: tokens.typography.fontWeight.regular,
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            body2: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: tokens.typography.fontWeight.regular,
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[500],
            } as TextStyle,
            caption: {
                fontFamily: tokens.typography.fontFamily.regular,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.regular,
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.neutral.gray[500],
            } as TextStyle,
            overline: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.xs * 1.5,
                letterSpacing: tokens.typography.letterSpacing.wide,
                textTransform: 'uppercase',
                color: tokens.color.neutral.gray[500],
            } as TextStyle,
            button: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.m,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.m * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                textTransform: 'none',
            } as TextStyle,
            label: {
                fontFamily: tokens.typography.fontFamily.medium,
                fontSize: tokens.typography.fontSize.s,
                fontWeight: tokens.typography.fontWeight.medium,
                lineHeight: tokens.typography.fontSize.s * 1.5,
                letterSpacing: tokens.typography.letterSpacing.normal,
                color: tokens.color.brand.blue[500],
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
            fabBackground: tokens.color.brand.teal[400],
            fabIcon: tokens.color.neutral.white,
            menuItemBackground: tokens.color.brand.blue[500],
            menuItemIcon: tokens.color.brand.green[200],
            elevation: 8,
        },

        card: {
            background: tokens.color.neutral.white,
            border: tokens.color.brand.green[200],
            titleColor: tokens.color.brand.blue[500],
            textColor: tokens.color.brand.blue[400],
            radius: tokens.radius.m,
            padding: tokens.spacing.m,
            elevation: tokens.shadow.s,
        },

        button: {
            primary: {
                background: tokens.color.brand.blue[500],
                text: tokens.color.neutral.white,
                border: 'transparent',
                radius: tokens.radius.m,
                pressedBackground: tokens.color.brand.blue[600],
                disabledBackground: tokens.color.neutral.gray[300],
                disabledText: tokens.color.neutral.gray[500],
            },
            secondary: {
                background: 'transparent',
                text: tokens.color.brand.blue[500],
                border: tokens.color.brand.blue[500],
                radius: tokens.radius.m,
                pressedBackground: `rgba(33, 52, 72, 0.1)`,
                disabledBackground: 'transparent',
                disabledText: tokens.color.neutral.gray[400],
            },
            text: {
                color: tokens.color.brand.blue[500],
                pressedColor: tokens.color.brand.blue[400],
                disabledColor: tokens.color.neutral.gray[400],
            },
        },

        inputs: {
            background: tokens.color.neutral.white,
            text: tokens.color.brand.blue[500],
            placeholder: tokens.color.neutral.gray[400],
            border: tokens.color.brand.green[200],
            focusBorder: tokens.color.brand.blue[500],
            radius: tokens.radius.m,
            error: tokens.color.functional.error.main,
            success: tokens.color.functional.success.main,
            padding: tokens.spacing.m,
            height: 56,
        },

        listItem: {
            background: tokens.color.neutral.white,
            pressedBackground: tokens.color.neutral.gray[50],
            titleColor: tokens.color.brand.blue[500],
            subtitleColor: tokens.color.brand.blue[400],
            border: tokens.color.neutral.gray[200],
            height: 72,
        },

        modal: {
            background: tokens.color.neutral.white,
            overlay: tokens.color.special.overlay,
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