import React, { useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  x: number;
  y: number;
  size: number;
  color: string;
  children: React.ReactNode;
};

const NodeTransform: React.FC<Props> = ({ x, y, size, color, children }) => {
  const translateX = useSharedValue(x - size / 2);
  const translateY = useSharedValue(y - size / 2);

  useEffect(() => {
    translateX.value = withSpring(x - size / 2);
    translateY.value = withSpring(y - size / 2);
  }, [x, y, size]);

  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: 12,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
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

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default NodeTransform;
