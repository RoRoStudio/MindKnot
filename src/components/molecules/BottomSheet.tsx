import React, { useEffect, useState, useCallback } from 'react';
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
    interpolate,
    useAnimatedGestureHandler,
    runOnJS,
} from 'react-native-reanimated';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';

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
const DRAG_DISMISS_THRESHOLD = 100;

/**
 * BottomSheet component provides a draggable sheet that slides up from the bottom of the screen
 * with configurable snap points, animations, and content areas
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

    const [shouldRender, setShouldRender] = useState(visible);

    // Update animation when visibility changes
    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            translateY.value = withTiming(0, { duration: animationDuration });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: animationDuration }, (isFinished) => {
                if (isFinished) {
                    runOnJS(setShouldRender)(false);
                }
            });
        }
    }, [visible, animationDuration]);

    // Convert any percentage values to absolute pixels
    const actualMaxHeight = typeof maxHeight === 'number'
        ? (maxHeight <= 1 ? SCREEN_HEIGHT * maxHeight : maxHeight)
        : SCREEN_HEIGHT * 0.9;

    // Calculate sheet heights
    const calculateSnapPoint = useCallback((percentage: number) => {
        const value = SCREEN_HEIGHT * percentage;
        return Math.min(Math.max(value, minHeight), actualMaxHeight);
    }, [minHeight, actualMaxHeight]);

    // Main content animation
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Backdrop animation
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateY.value,
            [0, SCREEN_HEIGHT],
            [backdropOpacity, 0],
            'clamp'
        ),
    }));

    // Pan gesture handler
    const gestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startY: number }
    >({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            if (dismissible) {
                translateY.value = Math.max(0, ctx.startY + event.translationY);
            }
        },
        onEnd: (event) => {
            if (dismissible && event.translationY > DRAG_DISMISS_THRESHOLD) {
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: animationDuration }, (isFinished) => {
                    if (isFinished) runOnJS(onClose)();
                });
            } else {
                // Snap to nearest point
                const snapPointValues = snapPoints.map(point => calculateSnapPoint(point));
                const currentPosition = translateY.value;

                // Find nearest snap point
                let closestPoint = snapPointValues[0];
                let minDistance = Math.abs(currentPosition - closestPoint);

                for (const point of snapPointValues) {
                    const distance = Math.abs(currentPosition - point);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = point;
                    }
                }

                translateY.value = withTiming(closestPoint, { duration: 200 });
            }
        },
    });

    // Calculate the content area height
    const dragHandleHeight = 30; // Estimated height of drag handle area
    const contentHeight = actualMaxHeight - (footerContent ? footerHeight : 0) - dragHandleHeight;

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
            backgroundColor: `rgba(0,0,0,${backdropOpacity})`,
        },
        sheetContainer: {
            position: 'relative',
            width: SCREEN_WIDTH,
            maxHeight: actualMaxHeight,
            minHeight: minHeight,
        },
        decorationLayer: {
            position: 'absolute',
            top: -6,
            left: -2,
            right: -2,
            bottom: 0,
            backgroundColor: theme.colors.primary,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            zIndex: 0,
        },
        contentWrapper: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            zIndex: 1,
            overflow: 'hidden',
            width: '100%',
            minHeight: minHeight,
            maxHeight: actualMaxHeight,
        },
        dragHandleContainer: {
            width: '100%',
            height: dragHandleHeight,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 10,
        },
        dragHandle: {
            width: 40,
            height: 5,
            backgroundColor: theme.colors.text + '50',
            borderRadius: 10,
        },
        contentContainer: {
            flexGrow: 1,
            padding: theme.spacing.m,
            maxHeight: contentHeight,
        },
        footerContainer: {
            width: '100%',
            padding: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            height: footerHeight,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    if (!shouldRender) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
            <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
                <Animated.View style={[styles.backdrop, backdropStyle]} />
            </TouchableWithoutFeedback>

            <PanGestureHandler onGestureEvent={gestureHandler} enabled={dismissible}>
                <Animated.View style={[styles.sheetContainer, animatedStyle]}>
                    <View style={styles.decorationLayer} />
                    <View style={styles.contentWrapper}>
                        {showDragIndicator && (
                            <View style={styles.dragHandleContainer}>
                                <View style={styles.dragHandle} />
                            </View>
                        )}

                        <ScrollView
                            contentContainerStyle={styles.contentContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
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
            </PanGestureHandler>
        </View>
    );
}); 