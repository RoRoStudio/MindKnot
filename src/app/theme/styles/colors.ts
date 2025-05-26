// This file is deprecated - use tokens.ts and the full theme system instead
// Keeping minimal exports for backward compatibility

import tokens from '../tokens';

export const baseColors = {
    white: tokens.color.neutral[25],    // Near-white (not pure white)
    black: tokens.color.neutral[900],   // Near-black (not pure black)
    // Legacy compatibility - these should be replaced with semantic theme colors
    nodeBlue: tokens.color.neutral[600],    // Replaced with neutral dark
    urgentRed: tokens.color.functional.error.main,  // Functional error color
    textSecondary: tokens.color.neutral[400], // Medium neutral for secondary text
};

export const lightColors = {
    background: tokens.color.neutral[25],   // Near-white background
    textPrimary: tokens.color.neutral[900], // Near-black text
    surface: tokens.color.neutral[50],      // Very light surface
    border: tokens.color.neutral[200],      // Light border
};

export const darkColors = {
    background: tokens.color.neutral[950],  // Deepest dark background
    textPrimary: tokens.color.neutral[50],  // Very light text
    surface: tokens.color.neutral[900],     // Dark surface
    border: tokens.color.neutral[700],      // Dark border
};
