import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture, GestureStateChangeEvent, TapGestureHandlerEventPayload } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS
} from 'react-native-reanimated';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import { engine, world, physics, cleanupPhysics, existingBodies } from './PhysicsEngine';

const NODE_SIZE = 50;
const { width, height } = Dimensions.get('window');

// Add interfaces for entity objects
interface GameEntity {
    body: Matter.Body;
    node: any;
    size: [number, number];
    color: string;
    renderer: React.FC<any>;
}

interface Entities {
    physics: {
        engine: Matter.Engine;
        world: Matter.World;
    };
    [key: string]: GameEntity | { engine: Matter.Engine; world: Matter.World };
}

export default function Canvas() {
    // Use individual selectors for better performance and proper context
    const nodes = useMindMapStore(state => state.nodes);
    const addNode = useMindMapStore(state => state.addNode);

    const [gameEngineKey, setGameEngineKey] = useState(0);
    const gameEngineRef = useRef(null);

    // Pan and zoom values
    const panX = useSharedValue(0);
    const panY = useSharedValue(0);
    const scale = useSharedValue(1);

    // Make this a proper JS function that can be called from a worklet
    const handleTap = (x: number, y: number) => {
        try {
            console.log("Canvas coordinates:", x, y);

            // Generate a random color
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            console.log("Generated random color:", randomColor);

            // Create a new node at this position
            console.log("Calling addNode function...");
            addNode({
                x,
                y,
                title: `Node ${nodes.length + 1}`,
                color: randomColor
            }).catch(err => {
                console.error("Error in addNode promise:", err);
            });
        } catch (err) {
            console.error("Error in tap handler:", err);
            if (err instanceof Error) {
                console.error("Error message:", err.message);
                console.error("Stack trace:", err.stack);
            }
        }
    };

    // Prepare entities based on nodes - make it memoized
    const prepareEntities = useCallback((): Entities => {
        console.log("Preparing entities for", nodes.length, "nodes");

        // Base entity with physics engine
        const entities: Entities = {
            physics: { engine, world }
        };

        // Track current entity IDs for cleanup
        const currentEntityKeys: string[] = ['physics'];

        // Create entities for each node
        nodes.forEach((node) => {
            // Use node ID as the entity key and Matter body label
            const entityKey = node.id;
            currentEntityKeys.push(entityKey);

            // Check if this body already exists in the world
            const existingBody = Matter.Composite.allBodies(world).find(
                body => body.label === entityKey
            );

            let body;

            if (existingBody) {
                // Use existing body, just update position if needed
                body = existingBody;

                // Prevent updating position if being dragged
                if (!body.isStatic) {
                    Matter.Body.setPosition(body, { x: node.x, y: node.y });
                }
            } else {
                // Create a new body
                body = Matter.Bodies.circle(node.x, node.y, NODE_SIZE / 2, {
                    label: entityKey,
                    restitution: 0.2,
                    frictionAir: 0.2,
                    friction: 0.1,
                });

                // Add to world
                Matter.World.add(world, body);
                console.log("Added new body to world:", entityKey);
            }

            // Create entity for this node
            entities[entityKey] = {
                body,
                node,
                size: [NODE_SIZE, NODE_SIZE],
                color: node.color,
                renderer: NodeCard
            } as GameEntity;
        });

        // Clean up any bodies that don't have entities anymore
        cleanupPhysics(currentEntityKeys);

        return entities;
    }, [nodes]);

    // Reset the game engine when nodes change
    useEffect(() => {
        try {
            // Refresh the game engine to avoid stale references
            setGameEngineKey(prev => prev + 1);
        } catch (err) {
            console.error("Error updating game engine:", err);
        }
    }, [nodes.length]); // Only recreate when nodes array length changes

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            try {
                // Clear all physics bodies
                Matter.World.clear(world, false);
                Matter.Engine.clear(engine);
            } catch (err) {
                console.error("Error cleaning up physics:", err);
            }
        };
    }, []);

    // Create a simple tap gesture with runOnJS
    const tapGesture = Gesture.Tap()
        .onEnd((event) => {
            console.log("Tap detected at:", event.absoluteX, event.absoluteY);

            // Convert screen coordinates to canvas coordinates
            const canvasX = (event.absoluteX - panX.value) / scale.value;
            const canvasY = (event.absoluteY - panY.value) / scale.value;

            // Call the JS function from the worklet
            runOnJS(handleTap)(canvasX, canvasY);
        })
        .runOnJS(true);  // Explicitly mark to run on JS thread

    // Define pan gesture for moving the canvas - FIXED PROPERTY NAMES
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Using translationX/Y instead of changeX/Y
            panX.value += event.translationX - panX.value;
            panY.value += event.translationY - panY.value;
        });

    // Define pinch gesture for zooming - FIXED PROPERTY NAME
    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            // Using scale instead of scaleChange
            scale.value = Math.max(0.5, Math.min(3, event.scale));
        });

    // Combine gestures with tap having priority
    const combinedGestures = Gesture.Exclusive(
        tapGesture,
        Gesture.Simultaneous(panGesture, pinchGesture)
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: panX.value },
            { translateY: panY.value },
            { scale: scale.value }
        ]
    }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={combinedGestures}>
                <View style={StyleSheet.absoluteFill}>
                    <Animated.View style={[styles.canvasWrapper, animatedStyle]}>
                        <GameEngine
                            key={gameEngineKey}
                            ref={gameEngineRef}
                            style={styles.gameEngine}
                            systems={[physics]}
                            entities={prepareEntities()}
                            running={true}
                        />
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    canvasWrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gameEngine: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});