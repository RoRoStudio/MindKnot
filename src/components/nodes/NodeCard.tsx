import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useSharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import Matter from 'matter-js';
import { NodeModel } from '../../types/NodeTypes';

const REPULSION_FORCE = 0.005;
const MIN_DISTANCE = 60;

type Props = {
    body: Matter.Body;
    node: NodeModel;
    size: [number, number];
    color: string;
};

const NodeCard: React.FC<Props> = ({ body, node, size, color }) => {
    const offsetX = useSharedValue(body.position.x - size[0] / 2);
    const offsetY = useSharedValue(body.position.y - size[1] / 2);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startX = offsetX.value;
            ctx.startY = offsetY.value;
        },
        onActive: (event, ctx: any) => {
            offsetX.value = ctx.startX + event.translationX;
            offsetY.value = ctx.startY + event.translationY;

            Matter.Body.setPosition(body, {
                x: offsetX.value + size[0] / 2,
                y: offsetY.value + size[1] / 2,
            });
        },
        onEnd: () => {
            // Optional inertia or snapping logic here
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        left: offsetX.value,
        top: offsetY.value,
        width: size[0],
        height: size[1],
        backgroundColor: color,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }));

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={animatedStyle}>
                <Text style={styles.label}>{node.title}</Text>
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    label: {
        color: '#1A1A1A',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default NodeCard;
