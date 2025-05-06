// src/components/nodes/NodeCard.tsx
import React, { useEffect } from 'react';
import { Text, StyleSheet, Platform, View, FlexAlignType } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
} from 'react-native-reanimated';
import Matter from 'matter-js';
import { NodeModel } from '../../types/NodeTypes';

type Props = {
    body: Matter.Body;
    node: NodeModel;
    size: [number, number];
    color: string;
};

// Define context type for gesture handler
type GestureContext = {
    startX: number;
    startY: number;
};

const NodeCard: React.FC<Props> = ({ body, node, size, color }) => {
    // Use shared values to track position instead of directly using body
    const positionX = useSharedValue(body.position.x - size[0] / 2);
    const positionY = useSharedValue(body.position.y - size[1] / 2);

    // Update shared values when body position changes
    useEffect(() => {
        positionX.value = body.position.x - size[0] / 2;
        positionY.value = body.position.y - size[1] / 2;
    }, [body.position.x, body.position.y, size]);

    // Create the animated style using shared values - with proper TypeScript types
    const animatedStyle = useAnimatedStyle(() => {
        // Create base style with proper type annotations
        const baseStyle = {
            position: 'absolute' as const,
            left: positionX.value,
            top: positionY.value,
            width: size[0],
            height: size[1],
            backgroundColor: color,
            borderRadius: 12,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        };

        // For Android, just add elevation
        if (Platform.OS === 'android') {
            return {
                ...baseStyle,
                elevation: 4,
            };
        }

        // For iOS, add shadow properties
        return {
            ...baseStyle,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        };
    });

    // Safe function to update physics body (runs on JS thread)
    const updatePhysicsBody = (x: number, y: number) => {
        Matter.Body.setPosition(body, {
            x: x + size[0] / 2,
            y: y + size[1] / 2
        });
    };

    const setBodyStatic = (isStatic: boolean) => {
        Matter.Body.setStatic(body, isStatic);
        if (!isStatic) {
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
        }
    };

    // Define the drag gesture handler with worklet and runOnJS
    const gestureHandler = useAnimatedGestureHandler<any, GestureContext>({
        onStart: (_, ctx) => {
            ctx.startX = positionX.value;
            ctx.startY = positionY.value;
            // Make body static during drag
            runOnJS(setBodyStatic)(true);
        },
        onActive: (event, ctx) => {
            // Update shared values for UI
            const newX = ctx.startX + event.translationX;
            const newY = ctx.startY + event.translationY;
            positionX.value = newX;
            positionY.value = newY;

            // Update physics body on JS thread
            runOnJS(updatePhysicsBody)(newX, newY);
        },
        onEnd: () => {
            // Make body dynamic again after drag
            runOnJS(setBodyStatic)(false);
        },
    });

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={animatedStyle}>
                <Text style={styles.label} numberOfLines={1}>
                    {node.title}
                </Text>
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    label: {
        color: '#1A1A1A',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
});

export default NodeCard;