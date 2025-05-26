import React, { useEffect, useState, useRef } from 'react';
import {
    Dimensions,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    useAnimatedGestureHandler,
    clamp
} from 'react-native-reanimated';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useTheme } from '../../app/contexts/ThemeContext';

/**
 * Props for the BottomSheet component
 */
export interface BottomSheetProps {
    /**
     * Whether the bottom sheet is visible
     */
    visible: boolean;

    /**
     * Function to call when the bottom sheet is closed
     */
    onClose: () => void;

    /**
     * Content to render inside the bottom sheet
     */
    children: React.ReactNode;

    /**
     * Optional content to render in the footer
     */
    footerContent?: React.ReactNode;

    /**
     * Array of snap points as percentages of screen height (0-1)
     * @default [0.9, 0.5]
     */
    snapPoints?: number[];

    /**
     * Whether to show the drag indicator at the top of the sheet
     * @default true
     */
    showDragIndicator?: boolean;

    /**
     * Duration of the open/close animation in milliseconds
     * @default 300
     */
    animationDuration?: number;

    /**
     * Maximum height of the sheet as pixels or percentage (0-1) of screen height
     * @default 0.9 (90% of screen height)
     */
    maxHeight?: number;

    /**
     * Minimum height of the sheet in pixels
     * @default 180
     */
    minHeight?: number;

    /**
     * Whether the sheet can be dismissed by dragging down
     * @default true
     */
    dismissible?: boolean;

    /**
     * Opacity of the backdrop when fully visible
     * @default 0.5
     */
    backdropOpacity?: number;

    /**
     * Height of the footer area in pixels
     * @default 80
     */
    footerHeight?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_CONTENT_HEIGHT = SCREEN_HEIGHT * 0.9;

/**
 * BottomSheet component provides a modal sheet that slides up from the bottom of the screen
 */
export const BottomSheet = React.memo<BottomSheetProps>(({
    visible,
    onClose,
    children,
    footerContent,
    snapPoints = [0.9, 0.5],
    showDragIndicator = true,
    animationDuration = 300,
    maxHeight = SCREEN_HEIGHT * 0.9,
    minHeight = 180,
    dismissible = true,
    backdropOpacity = 0.5,
    footerHeight = 80,
}) => {
    // Get theme
    const { theme } = useTheme();

    // Animation values
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const opacity = useSharedValue(0);

    const [shouldRender, setShouldRender] = useState(visible);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Handle keyboard events
    useEffect(() => {
        const keyboardWillShowListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillShow', (event) => setKeyboardHeight(event.endCoordinates.height))
            : null;
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (event) => {
                setKeyboardHeight(event.endCoordinates.height);
            }
        );
        const keyboardWillHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0))
            : null;
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, []);

    // Update animation when visibility changes
    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            translateY.value = withTiming(0, { duration: animationDuration });
            opacity.value = withTiming(backdropOpacity, { duration: animationDuration });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: animationDuration }, (isFinished) => {
                if (isFinished) {
                    runOnJS(setShouldRender)(false);
                }
            });
            opacity.value = withTiming(0, { duration: animationDuration });
        }
    }, [visible, animationDuration, backdropOpacity, translateY, opacity]);

    // Convert any percentage values to absolute pixels
    const actualMaxHeight = typeof maxHeight === 'number'
        ? (maxHeight <= 1 ? SCREEN_HEIGHT * maxHeight : maxHeight)
        : SCREEN_HEIGHT * 0.9;

    // Get current snap point as pixels
    const getSnapPoints = () => {
        return snapPoints.map(point =>
            typeof point === 'number' && point <= 1
                ? SCREEN_HEIGHT * (1 - point) // Convert from percentage to actual position
                : SCREEN_HEIGHT - point
        );
    };

    // Handle gestures for the drag handle
    const gestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startY: number }
    >({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            // Only allow dragging down or up to limits
            translateY.value = clamp(
                ctx.startY + event.translationY,
                0,  // Don't allow dragging above origin
                SCREEN_HEIGHT // Full height of screen
            );
        },
        onEnd: (event, _) => {
            // If dragging down with significant velocity or distance, close the sheet
            if ((event.velocityY > 500 || translateY.value > SCREEN_HEIGHT / 2) && dismissible) {
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: animationDuration }, (finished) => {
                    if (finished) {
                        runOnJS(onClose)();
                    }
                });
                return;
            }

            // Otherwise snap to the closest snap point
            const snapPointsInPx = getSnapPoints();
            let closestPoint = 0; // Default to fully open
            let minDistance = SCREEN_HEIGHT;

            for (const point of snapPointsInPx) {
                const distance = Math.abs(translateY.value - point);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            }

            translateY.value = withTiming(closestPoint, { duration: animationDuration });
        },
    });

    // Main content animation
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Backdrop animation
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Calculate the content area height
    const dragHandleHeight = 30; // Estimated height of drag handle area
    const adjustedFooterHeight = footerContent ? footerHeight : 0;
    const calculatedMaxContentHeight = actualMaxHeight - adjustedFooterHeight - dragHandleHeight;

    // Handle close
    const handleClose = () => {
        if (dismissible) {
            onClose();
        }
    };

    // Base styles
    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'flex-end',
            zIndex: 1000,
            width: '100%',
            height: '100%',
        },
        backdrop: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.overlay,
        },
        sheetContainer: {
            position: 'absolute',
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            width: SCREEN_WIDTH,
            maxHeight: Math.min(actualMaxHeight, MAX_CONTENT_HEIGHT),
            minHeight: minHeight,
        },
        contentWrapper: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
            width: '100%',
            minHeight: minHeight,
            maxHeight: Math.min(actualMaxHeight, MAX_CONTENT_HEIGHT),
            // Add shadow
            shadowColor: theme.colors.shadow,
            shadowOffset: {
                width: 0,
                height: -3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,
            elevation: 6,
        },
        dragHandleContainer: {
            width: '100%',
            height: dragHandleHeight,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 10,
            zIndex: 10,
        },
        dragHandle: {
            width: 40,
            height: 5,
            backgroundColor: theme.colors.textPrimary + '50',
            borderRadius: theme.shape.radius.m,
        },
        scrollView: {
            width: '100%',
            maxHeight: calculatedMaxContentHeight,
            flexGrow: 0,
        },
        contentContainer: {
            padding: theme.spacing.m,
            paddingTop: 0,
        },
        footerContainer: {
            width: '100%',
            padding: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            height: adjustedFooterHeight,
            justifyContent: 'center',
            alignItems: 'center',
        },
        overlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'flex-end',
        },
    });

    if (!shouldRender) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View style={[styles.backdrop, backdropStyle]} />
            </TouchableWithoutFeedback>

            <Animated.View style={[styles.sheetContainer, animatedStyle]}>
                <View style={styles.contentWrapper}>
                    <PanGestureHandler onGestureEvent={gestureHandler} enabled={dismissible}>
                        <Animated.View style={styles.dragHandleContainer}>
                            {showDragIndicator && <View style={styles.dragHandle} />}
                        </Animated.View>
                    </PanGestureHandler>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.contentContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {children}
                    </ScrollView>

                    {footerContent && (
                        <View style={styles.footerContainer}>
                            {footerContent}
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
});