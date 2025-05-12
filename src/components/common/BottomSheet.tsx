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
    GestureHandlerRootView,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAG_DISMISS_THRESHOLD = 100;

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
}) => {
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

        onStart: (_, ctx: { startY: number }) => {

            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            translateY.value = ctx.startY + event.translationY;
        },
        onEnd: (event) => {
            if (event.translationY > DRAG_DISMISS_THRESHOLD) {
                translateY.value = withTiming(
                    SCREEN_HEIGHT,
                    { duration: 250 },
                    (isFinished) => {
                        if (isFinished) runOnJS(onClose)();
                    }
                );
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

            {/* Tap outside to dismiss */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            {/* Swipe + keyboard dismiss */}
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                    style={[
                        {
                            backgroundColor: 'white',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 20,
                            minHeight: 200,
                            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
                        },
                        animatedStyle,
                    ]}
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
                </Animated.View>
            </PanGestureHandler>
        </Animated.View>
    );
};
