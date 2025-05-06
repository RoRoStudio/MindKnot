import React, from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDecay,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Canvas() {
    const { nodes, addNode } = useMindMapStore();

    const panX = useSharedValue(0);
    const panY = useSharedValue(0);
    const scale = useSharedValue(1);

    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = e.scale;
        })
        .onEnd(() => {
            scale.value = withTiming(1); // reset zoom for now
        });

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            panX.value += e.changeX;
            panY.value += e.changeY;
        })
        .onEnd((e) => {
            panX.value = withDecay({ velocity: e.velocityX });
            panY.value = withDecay({ velocity: e.velocityY });
        });

    const tap = Gesture.Tap()
        .onEnd((e) => {
            const x = (e.x - panX.value) / scale.value;
            const y = (e.y - panY.value) / scale.value;
            runOnJS(addNode)({ x, y });
        });

    const gesture = Gesture.Simultaneous(pan, pinch, tap);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: panX.value },
            { translateY: panY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                {nodes.map((node) => (
                    <NodeCard key={node.id} node={node} />
                ))}
            </Animated.View>
        </GestureDetector>
    );
}
