import React, { ReactNode } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';

interface Props {
    children: ReactNode;
}

export default function PanZoomLayer({ children }: Props) {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const pinch = Gesture.Pinch().onUpdate((e) => {
        scale.value = e.scale;
    });

    const pan = Gesture.Pan().onUpdate((e) => {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
    });

    const gesture = Gesture.Simultaneous(pinch, pan);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[animatedStyle, { flex: 1 }]}>{children}</Animated.View>
        </GestureDetector>
    );
}
