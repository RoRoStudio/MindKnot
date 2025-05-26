// src/utils/themeUtils.ts
import { ThemeType, ColorPalette } from '../../app/theme/themeTypes';

/**
 * Gets a color value from the theme using a path string
 * 
 * @param theme The theme object
 * @param colorPath A dot-notation path to the color (e.g., 'colors.primary', 'components.button.primary.background')
 * @param fallback Optional fallback color if the path is not found
 * @returns The color value
 */
export function getThemeColor(
    theme: ThemeType,
    colorPath: string,
    fallback: string = '#000000'
): string {
    try {
        const parts = colorPath.split('.');
        let current: any = theme;

        for (const part of parts) {
            if (current && part in current) {
                current = current[part];
            } else {
                return fallback;
            }
        }

        return typeof current === 'string' ? current : fallback;
    } catch (error) {
        console.warn(`Error getting theme color for path: ${colorPath}`, error);
        return fallback;
    }
}

/**
 * Calculates a new color with opacity based on a base color
 * 
 * @param baseColor The base color (hex format)
 * @param opacity Opacity between 0 and 1
 * @returns The color with opacity applied in rgba format
 */
export function withOpacity(baseColor: string, opacity: number): string {
    // Handle case where baseColor is already in rgba format
    if (baseColor.startsWith('rgba')) {
        const rgbaMatch = baseColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/);
        if (rgbaMatch) {
            const [, r, g, b] = rgbaMatch;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }

    // Handle case where baseColor is in rgb format
    if (baseColor.startsWith('rgb(')) {
        const rgbMatch = baseColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }

    // Handle hex color format
    let hex = baseColor.replace('#', '');

    // Convert short hex to full hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Convert hex to rgb
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Derives a lighter version of a given color
 * 
 * @param color The base color
 * @param percent How much lighter to make the color (0-100)
 * @returns The lightened color
 */
export function lighten(color: string, percent: number = 20): string {
    return adjustColor(color, percent);
}

/**
 * Derives a darker version of a given color
 * 
 * @param color The base color
 * @param percent How much darker to make the color (0-100)
 * @returns The darkened color
 */
export function darken(color: string, percent: number = 20): string {
    return adjustColor(color, -percent);
}

/**
 * Adjusts a color by making it lighter or darker
 * 
 * @param color The base color
 * @param percent Positive for lighter, negative for darker
 * @returns The adjusted color
 */
function adjustColor(color: string, percent: number): string {
    // Extract RGB components
    let r: number = 0, g: number = 0, b: number = 0;

    if (color.startsWith('rgb')) {
        const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/);
        if (rgbMatch) {
            r = parseInt(rgbMatch[1], 10);
            g = parseInt(rgbMatch[2], 10);
            b = parseInt(rgbMatch[3], 10);
        } else {
            return color;
        }
    } else {
        // Handle hex format
        let hex = color.replace('#', '');

        // Convert short hex to full hex
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    // Adjust the color
    r = Math.max(0, Math.min(255, Math.round(r + (percent / 100) * 255)));
    g = Math.max(0, Math.min(255, Math.round(g + (percent / 100) * 255)));
    b = Math.max(0, Math.min(255, Math.round(b + (percent / 100) * 255)));

    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}