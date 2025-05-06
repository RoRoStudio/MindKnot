import React, { useEffect } from 'react';
import { Text, StyleSheet, Platform, View } from 'react-native';
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
    simultaneousHandlers?: any;
};

type GestureContext = {
    startX: number;
    startY: number;
};

const NodeCard: React.FC<Props> = ({ body, node, size, color, simultaneousHandlers }) => {
    const positionX = useSharedValue(body.position.x - size[0] / 2);
    const positionY = useSharedValue(body.position.y - size[1] / 2);

    useEffect(() => {
        positionX.value = body.position.x - size[0] / 2;
        positionY.value = body.position.y - size[1] / 2;
    }, [body.position.x, body.position.y, size]);

    const animatedStyle = useAnimatedStyle(() => {
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

        return Platform.OS === 'android'
            ? { ...baseStyle, elevation: 4 }
            : {
                ...baseStyle,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            };
    });

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

    const gestureHandler = useAnimatedGestureHandler<any, GestureContext>({
        onStart: (_, ctx) => {
            ctx.startX = positionX.value;
            ctx.startY = positionY.value;
            runOnJS(setBodyStatic)(true);
        },
        onActive: (event, ctx) => {
            const newX = ctx.startX + event.translationX;
            const newY = ctx.startY + event.translationY;
            positionX.value = newX;
            positionY.value = newY;
            runOnJS(updatePhysicsBody)(newX, newY);
        },
        onEnd: () => {
            runOnJS(setBodyStatic)(false);
        },
    });

    return (
        <PanGestureHandler
            onGestureEvent={gestureHandler}
            simultaneousHandlers={simultaneousHandlers}
        >
            <Animated.View style={animatedStyle}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{node.icon || '🔖'}</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                    {node.title || 'Untitled'}
                </Text>
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        fontSize: 24,
    },
    title: {
        position: 'absolute',
        bottom: -18,
        fontSize: 12,
        fontWeight: '500',
        color: '#1A1A1A',
        textAlign: 'center',
        width: '100%',
    },
});

export default NodeCard;
