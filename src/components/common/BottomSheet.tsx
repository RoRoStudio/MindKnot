// src/components/common/BottomSheet.tsx
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

// Define props type
export interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    footerContent?: React.ReactNode;
    snapPoints?: number[];
    showDragIndicator?: boolean;
    animationDuration?: number;
    maxHeight?: number;
    minHeight?: number;
    dismissible?: boolean;
    backdropOpacity?: number;
    footerHeight?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAG_DISMISS_THRESHOLD = 100;

export const BottomSheet: React.FC<BottomSheetProps> = ({
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
            paddingVertical: 10,
            alignItems: 'center',
        },
        dragHandle: {
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: '#ccc',
            alignSelf: 'center',
            marginBottom: 12,
        },
        contentContainer: {
            paddingHorizontal: 20,
            width: '100%',
            maxHeight: contentHeight,
        },
        scrollViewContent: {
            flexGrow: 1,
            paddingBottom: footerContent ? 20 : Platform.OS === 'ios' ? 40 : 20,
        },
        footer: {
            width: '100%',
            height: footerHeight,
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider || '#eee',
            paddingHorizontal: 20,
            paddingVertical: 10,
            justifyContent: 'center',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
        },
    });

    if (!shouldRender) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>
            </Animated.View>

            {/* Sheet */}
            <Animated.View style={[styles.sheetContainer, animatedStyle]}>
                {/* Background decoration */}
                <View style={styles.decorationLayer} />

                {/* Content */}
                <View style={styles.contentWrapper}>
                    {/* Drag handle */}
                    <PanGestureHandler onGestureEvent={gestureHandler} enabled={dismissible}>
                        <Animated.View>
                            <View style={styles.dragHandleContainer}>
                                {showDragIndicator && <View style={styles.dragHandle} />}
                            </View>
                        </Animated.View>
                    </PanGestureHandler>

                    {/* Content area with ScrollView */}
                    <View style={styles.contentContainer}>
                        <ScrollView
                            contentContainerStyle={styles.scrollViewContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={true}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={{ width: '100%' }}>
                                    {children}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>

                    {/* Fixed Footer Content */}
                    {footerContent && (
                        <View style={styles.footer}>
                            {footerContent}
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};