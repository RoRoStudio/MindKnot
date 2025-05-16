/**
 * Shared prop types for commonly used patterns across components
 */

import { StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * Standard size variants used throughout the application
 */
export type SizeVariant = 'xs' | 'small' | 'medium' | 'large' | 'xl';

/**
 * Standard button/interactive component variants
 */
export type VariantType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Standard style prop types
 */
export interface StyleProps {
    /**
     * Optional style for the container
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Optional style for the content
     */
    contentStyle?: StyleProp<ViewStyle>;

    /**
     * Optional style for text elements
     */
    textStyle?: StyleProp<TextStyle>;
}

/**
 * Props for elements that can be disabled
 */
export interface DisableableProps {
    /**
     * Whether the component is disabled
     * @default false
     */
    disabled?: boolean;
}

/**
 * Props for elements that can be selected
 */
export interface SelectableProps {
    /**
     * Whether the component is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Whether the component is selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Callback for when the component is pressed (when selectable)
     */
    onPress?: () => void;
}

/**
 * Props for components with loading states
 */
export interface LoadingProps {
    /**
     * Whether the component is in a loading state
     * @default false
     */
    isLoading?: boolean;
}

/**
 * Props for components with children
 */
export interface ChildrenProps {
    /**
     * Content to render inside the component
     */
    children: React.ReactNode;
}

/**
 * Props for components with icons
 */
export interface IconProps {
    /**
     * Name of the icon
     */
    iconName?: string;

    /**
     * Size of the icon
     * @default 24
     */
    iconSize?: number;

    /**
     * Color of the icon
     */
    iconColor?: string;
}

/**
 * Props for modal-like components
 */
export interface ModalProps {
    /**
     * Whether the modal is visible
     */
    visible: boolean;

    /**
     * Function to call when the modal is closed
     */
    onClose: () => void;
}

/**
 * Props for form components
 */
export interface FormControlProps {
    /**
     * Label for the form control
     */
    label?: string;

    /**
     * Whether the form control is required
     * @default false
     */
    required?: boolean;

    /**
     * Error message to display
     */
    error?: string;

    /**
     * Helper text to display below the form control
     */
    helperText?: string;
}

/**
 * Props for input components
 */
export interface InputProps extends FormControlProps, DisableableProps {
    /**
     * Value of the input
     */
    value: string;

    /**
     * Function to call when the input value changes
     */
    onChangeText: (text: string) => void;

    /**
     * Placeholder text to display when the input is empty
     */
    placeholder?: string;
} 