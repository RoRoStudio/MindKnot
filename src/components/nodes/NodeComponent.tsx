import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { Node } from '../../types/Node';
import { useNodeStore } from '../../state/useNodeStore';

interface Props {
    node: Node;
    onSelect: (id: string) => void;
    isSelected: boolean;
}

type GestureContext = {
    startX: number;
    startY: number;
};

export default function NodeComponent({ node, onSelect, isSelected }: Props) {
    const { updateNodePosition } = useNodeStore();
    const scale = useSharedValue(1);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, context: GestureContext) => {
            scale.value = withSpring(1.1);
            context.startX = node.body.position.x;
            context.startY = node.body.position.y;
        },
        onActive: (event, context: GestureContext) => {
            runOnJS(updateNodePosition)(
                node.id,
                context.startX + event.translationX,
                context.startY + event.translationY
            );
        },
        onEnd: () => {
            scale.value = withSpring(1);
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value }
            ],
        };
    });

    // Handle node tap for selection/linking
    const handlePress = () => {
        onSelect(node.id);
    };

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        left: node.body.position.x - node.body.radius,
                        top: node.body.position.y - node.body.radius,
                        width: node.body.radius * 2,
                        height: node.body.radius * 2,
                        borderRadius: node.body.radius,
                        backgroundColor: node.color,
                        // Add highlight border when selected
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: '#fff',
                    },
                    animatedStyle
                ]}
            >
                <Pressable
                    style={styles.content}
                    onPress={handlePress}
                >
                    <Text style={styles.text}>{node.title}</Text>
                </Pressable>
            </Animated.View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    content: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    }
});