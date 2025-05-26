import { Dimensions, Platform, StatusBar } from 'react-native';
import tokens from './tokens';

/**
 * Device dimensions
 */
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * Safe area insets and constants for different platforms
 */
export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
export const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 83 : 64; // Height of bottom tab navigator
export const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56; // Standard header height
export const BOTTOM_SAFE_AREA = Platform.OS === 'ios' ? 34 : 0; // Safe area at bottom for notched devices

/**
 * Card and list item dimensions
 */
export const CARD_MARGIN = tokens.spacing.s;
export const CARD_BORDER_RADIUS = tokens.radius.m;
export const LIST_ITEM_HEIGHT = 72;
export const LIST_ITEM_AVATAR_SIZE = 40;

/**
 * Grid system
 */
export const GRID = {
    COLUMNS: 12,
    GUTTER: tokens.spacing.m,
    MARGIN: tokens.spacing.m,
    // Helpers for calculating column widths
    getColumnWidth: (cols: number) => {
        const fullWidth = SCREEN_WIDTH - (2 * GRID.MARGIN);
        const totalGutterWidth = GRID.GUTTER * (GRID.COLUMNS - 1);
        const totalColumnWidth = fullWidth - totalGutterWidth;
        const singleColumnWidth = totalColumnWidth / GRID.COLUMNS;
        return singleColumnWidth * cols + GRID.GUTTER * (cols - 1);
    }
};

/**
 * Animation durations and timing
 */
export const ANIMATION = {
    DURATION: {
        FAST: tokens.animation.duration.fast,
        NORMAL: tokens.animation.duration.normal,
        SLOW: tokens.animation.duration.slow,
    },
    EASING: {
        STANDARD: tokens.animation.easing.standard,
        ACCELERATE: tokens.animation.easing.accelerate,
        DECELERATE: tokens.animation.easing.decelerate,
    },
};

/**
 * Constants for layout ratios (useful for maintaining aspect ratios)
 */
export const ASPECT_RATIOS = {
    SQUARE: 1,
    LANDSCAPE: 16 / 9,
    PORTRAIT: 3 / 4,
    WIDE: 21 / 9,
    GOLDEN_RATIO: 1.618,
};

/**
 * Commonly used component sizes
 */
export const COMPONENT_SIZES = {
    ICON: {
        SMALL: 16,
        MEDIUM: 24,
        LARGE: 32,
    },
    AVATAR: {
        SMALL: 32,
        MEDIUM: 48,
        LARGE: 64,
    },
    BUTTON: {
        HEIGHT: {
            SMALL: 32,
            MEDIUM: 44,
            LARGE: 56,
        },
        MIN_WIDTH: {
            SMALL: 64,
            MEDIUM: 88,
            LARGE: 120,
        },
    },
    INPUT: {
        HEIGHT: 56,
        PADDING: tokens.spacing.m,
    },
};

/**
 * Z-index values for controlling element layering
 */
export const Z_INDEX = {
    BASE: tokens.zIndex.base,
    TOOLTIP: tokens.zIndex.tooltip,
    DROPDOWN: tokens.zIndex.dropdown,
    STICKY_HEADER: tokens.zIndex.sticky,
    MODAL: tokens.zIndex.modal,
    TOAST: tokens.zIndex.toast,
};

/**
 * Common interactions
 */
export const INTERACTIONS = {
    PRESS_OPACITY: 0.7,
    DISABLED_OPACITY: 0.5,
    HIGHLIGHT_OPACITY: 0.1,
    RIPPLE_DURATION: 250,
};

export default {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    STATUSBAR_HEIGHT,
    BOTTOM_TAB_HEIGHT,
    HEADER_HEIGHT,
    BOTTOM_SAFE_AREA,
    CARD_MARGIN,
    CARD_BORDER_RADIUS,
    LIST_ITEM_HEIGHT,
    LIST_ITEM_AVATAR_SIZE,
    GRID,
    ANIMATION,
    ASPECT_RATIOS,
    COMPONENT_SIZES,
    Z_INDEX,
    INTERACTIONS,
}; 