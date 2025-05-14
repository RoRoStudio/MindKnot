import React, { useEffect } from 'react';
import {
    Dimensions,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
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

// ✅ Define props at the top
interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAG_DISMISS_THRESHOLD = 100;

// ✅ Component starts here
export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
}) => {
    const { theme } = useTheme(); // ✅ Now valid hook usage

    const translateY = useSharedValue(SCREEN_HEIGHT);

    useEffect(() => {
        translateY.value = withTiming(visible ? 0 : SCREEN_HEIGHT, { duration: 300 });
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const gestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startY: number }
    >({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            translateY.value = Math.max(0, ctx.startY + event.translationY);
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

    if (!visible) return null;

    const backdropStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(0,0,0,${interpolate(
            translateY.value,
            [0, SCREEN_HEIGHT],
            [0.5, 0],
            'clamp'
        )})`,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    justifyContent: 'flex-end',
                },
                backdropStyle,
            ]}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={[{ position: 'relative' }, animatedStyle]}>
                    {/* Background layer that peeks out on top */}
                    <View
                        style={{
                            position: 'absolute',
                            top: -6, // Offset upward to peek above
                            left: -2,
                            right: -2,
                            bottom: 0, // Full height of parent
                            backgroundColor: theme.colors.primary,
                            borderTopLeftRadius: 18,
                            borderTopRightRadius: 18,
                            zIndex: 0,
                        }}
                    />

                    {/* Foreground white sheet */}
                    <View
                        style={{
                            backgroundColor: 'white',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 20,
                            minHeight: 180, // Slightly shorter
                            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
                            zIndex: 1,
                        }}
                    >
                        {/* Drag handle */}
                        <View
                            style={{
                                width: 40,
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: '#ccc',
                                alignSelf: 'center',
                                marginBottom: 12,
                            }}
                        />

                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>{children}</View>
                        </TouchableWithoutFeedback>
                    </View>
                </Animated.View>
            </PanGestureHandler>


        </Animated.View>
    );
};
