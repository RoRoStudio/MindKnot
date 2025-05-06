import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    withDecay
} from 'react-native-reanimated';
import { useNodeStore } from '../../state/useNodeStore';
import NodeComponent from '../nodes/NodeComponent';
import ConnectionLine from '../nodes/ConnectionLine';

const { width, height } = Dimensions.get('window');

// Canvas boundaries
const CANVAS_BOUNDS = {
    minX: -width / 2,
    maxX: width / 2,
    minY: -height / 2,
    maxY: height / 2
};

export default function Canvas() {
    const { nodes, links, addNode, updatePhysics, initWorld, connectNodes } = useNodeStore();

    // Initialize physics world
    useEffect(() => {
        initWorld();
    }, []);

    // Setup physics animation loop
    useEffect(() => {
        const interval = setInterval(() => {
            updatePhysics();
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, []);

    // Values for canvas panning and zooming
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    // Node selection for creating links
    const [selectedNode, setSelectedNode] = React.useState<string | null>(null);

    // Handle node selection for linking
    const handleNodeSelect = (nodeId: string) => {
        if (selectedNode && selectedNode !== nodeId) {
            // Create a link between the previously selected node and this one
            connectNodes(selectedNode, nodeId);
            setSelectedNode(null);
        } else {
            // First node in the link
            setSelectedNode(nodeId);
        }
    };

    // Double tap to add a node
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd((e) => {
            // Calculate position considering pan and zoom
            const canvasX = (e.x - translateX.value) / scale.value;
            const canvasY = (e.y - translateY.value) / scale.value;
            runOnJS(addNode)(canvasX, canvasY);
        });

    // Pan gesture for moving the canvas - REDUCED SENSITIVITY
    const pan = Gesture.Pan()
        .onUpdate((e) => {
            // Reduce movement speed by applying a dampening factor (0.5)
            const dampingFactor = 0.5;

            // Calculate new translation values
            const newX = translateX.value + e.translationX * dampingFactor;
            const newY = translateY.value + e.translationY * dampingFactor;

            // Constrain translation to prevent canvas from moving too far
            translateX.value = Math.max(CANVAS_BOUNDS.minX, Math.min(CANVAS_BOUNDS.maxX, newX));
            translateY.value = Math.max(CANVAS_BOUNDS.minY, Math.min(CANVAS_BOUNDS.maxY, newY));
        })
        .onEnd((e) => {
            // Add gentle inertia with bounds
            const velocityFactor = 0.3;

            translateX.value = withDecay({
                velocity: e.velocityX * velocityFactor,
                clamp: [CANVAS_BOUNDS.minX, CANVAS_BOUNDS.maxX]
            });

            translateY.value = withDecay({
                velocity: e.velocityY * velocityFactor,
                clamp: [CANVAS_BOUNDS.minY, CANVAS_BOUNDS.maxY]
            });
        });

    // Pinch gesture for zooming - IMPROVED STABILITY
    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            // Smoother, more controlled zoom
            const zoomFactor = 0.01;
            const newScale = scale.value * (1 + (e.scale - 1) * zoomFactor);

            // Limit zoom range
            scale.value = Math.max(0.5, Math.min(2, newScale));
        });

    // Combine gestures
    const gesture = Gesture.Simultaneous(
        pan,
        pinch,
        doubleTap
    );

    // Animated style for pan and zoom
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.canvas, animatedStyle]}>
                    {/* Render connections */}
                    {links.map(link => (
                        <ConnectionLine key={link.id} link={link} />
                    ))}

                    {/* Render nodes */}
                    {nodes.map(node => (
                        <NodeComponent
                            key={node.id}
                            node={node}
                            onSelect={handleNodeSelect}
                            isSelected={node.id === selectedNode}
                        />
                    ))}
                </Animated.View>
            </GestureDetector>

            {/* Link mode indicator */}
            {selectedNode && (
                <View style={styles.linkModeIndicator}>
                    <Text style={styles.linkModeText}>
                        Tap another node to create a link
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#f7f7f7',
    },
    canvas: {
        width: width,
        height: height,
    },
    linkModeIndicator: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 20,
    },
    linkModeText: {
        color: 'white',
        fontWeight: 'bold',
    }
});