import React, { useEffect, useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { useMindMapStore } from '../../state/useMindMapStore';
import { engine, world, physics } from './PhysicsEngine';
import NodeCard from '../nodes/NodeCard';

const NODE_SIZE = 50;
const { width, height } = Dimensions.get('window');

export default function Canvas() {
    const { nodes, addNode } = useMindMapStore();
    const panX = useSharedValue(0);
    const panY = useSharedValue(0);
    const scale = useSharedValue(1);

    const entities: { [key: string]: any } = {
        physics: { engine, world },
    };

    nodes.forEach((node) => {
        const body = Matter.Bodies.circle(node.x, node.y, NODE_SIZE / 2, {
            label: node.id,
            restitution: 0.9,
            frictionAir: 0.15,
        });

        Matter.World.add(world, body);

        entities[node.id] = {
            body,
            node,
            size: [NODE_SIZE, NODE_SIZE],
            color: node.color,
            renderer: NodeCard,
        };
    });

    const tapGesture = Gesture.Tap().onEnd((e) => {
        const canvasX = (e.absoluteX - panX.value) / scale.value;
        const canvasY = (e.absoluteY - panY.value) / scale.value;
        addNode({ x: canvasX, y: canvasY });
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: panX.value },
            { translateY: panY.value },
            { scale: scale.value },
        ],
    }));

    useEffect(() => {
        return () => {
            Matter.World.clear(world, false);
            Matter.Engine.clear(engine);
        };
    }, []);

    return (
        <GestureDetector gesture={tapGesture}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <GameEngine
                    style={styles.container}
                    systems={[physics]}
                    entities={entities}
                    running
                />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
});