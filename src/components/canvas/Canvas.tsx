import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useNodeStore } from '../../state/useNodeStore';
import NodeCard from '../nodes/NodeCard';
import ConnectionLine from '../nodes/ConnectionLine';

export default function Canvas() {
  const { nodes, links, addNode } = useNodeStore();

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 200 }); // optional reset
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
    .numberOfTaps(1)
    .onEnd((e) => {
      runOnJS(addNode)(e.x - panX.value, e.y - panY.value);
    });

  const composed = Gesture.Simultaneous(pan, pinch, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        {links.map((l, i) => (
          <ConnectionLine key={i} link={l} />
        ))}
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}
