// src/components/common/BottomSheet.tsx
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    StyleSheet,
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
interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAG_DISMISS_THRESHOLD = 100;

export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
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
            translateY.value = withTiming(0, { duration: 300 });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, (isFinished) => {
                if (isFinished) {
                    runOnJS(setShouldRender)(false);
                }
            });
        }
    }, [visible]);


    // Main content animation
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Backdrop animation
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateY.value,
            [0, SCREEN_HEIGHT],
            [1, 0],
            'clamp'
        ),
    }));

    // Pan gesture handler
    const gestureHandler = useAnimatedGestureHandler
    PanGestureHandlerGestureEvent,
        { startY: number }
        > ({
            onStart: (_, ctx) => {
                ctx.startY = translateY.value;
            },
            onActive: (event, ctx) => {
                // Only allow dragging down (positive translation)
                if (event.translationY > 0) {
                    translateY.value = Math.max(0, ctx.startY + event.translationY);
                }
            },
            onEnd: (event) => {
                if (event.translationY > DRAG_DISMISS_THRESHOLD) {
                    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (isFinished) => {
                        if (isFinished) runOnJS(onClose)();
                    });
                } else {
                    translateY.value = withTiming(0, { duration: 200 });
                }
            },
        });

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
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        sheetContainer: {
            position: 'relative',
            width: '100%',
            maxHeight: SCREEN_HEIGHT * 0.9,
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
        contentContainer: {
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: SCREEN_HEIGHT * 0.9,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
            zIndex: 1,
            width: '100%',
        },
        dragHandle: {
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: '#ccc',
            alignSelf: 'center',
            marginBottom: 12,
        },
        childrenContainer: {
            width: '100%',
            flex: 1,
        }
    });

    if (!shouldRender) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>
            </Animated.View>

            {/* Sheet */}
            <Animated.View style={[styles.sheetContainer, animatedStyle]}>
                {/* Background decoration */}
                <View style={styles.decorationLayer} />

                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Drag handle */}
                    <PanGestureHandler onGestureEvent={gestureHandler}>
                        <Animated.View>
                            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                                <View style={styles.dragHandle} />
                            </View>
                        </Animated.View>
                    </PanGestureHandler>

                    {/* Content area */}
                    <View style={styles.childrenContainer}>
                        {children}
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};