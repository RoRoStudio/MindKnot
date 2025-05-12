// src/components/sagas/AnimatedBookSaga.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { Icon, IconName } from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../common/Typography';

let globalOpenBookId: string | null = null;

interface AnimatedBookSagaProps {
  saga: {
    id: string;
    name: string;
    icon: IconName;
  };
  width: number;
  height: number;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_HEIGHT = Dimensions.get('window').height;
const ANIMATION_DURATION = 500;
const PERSPECTIVE = 1200;

import { measure, useAnimatedRef } from 'react-native-reanimated';

const animatedRef = useAnimatedRef<View>();

export const AnimatedBookSaga: React.FC<AnimatedBookSagaProps> = ({
  saga,
  width,
  height,
  onPress
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Original position values
  const originalX = useSharedValue(0);
  const originalY = useSharedValue(0);
  const originalScale = useSharedValue(1);

  // Animation values for book movement
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Animation values for pages
  const frontRotate = useSharedValue(0);
  const backRotate = useSharedValue(0);
  const page1Rotate = useSharedValue(0);
  const page2Rotate = useSharedValue(0);
  const page3Rotate = useSharedValue(0);
  const page4Rotate = useSharedValue(0);
  const page5Rotate = useSharedValue(0);
  const page6Rotate = useSharedValue(0);

  // Record initial layout and calculate movement offsets
  const setInitialPosition = (event: any) => {
    const { layout } = event.nativeEvent;

    originalX.value = layout.x;
    originalY.value = layout.y;
  };

  // Animate book to center and open
  const openBook = () => {
    const screenCenterX = SCREEN_WIDTH / 2;
    const screenCenterY = SCREEN_HEIGHT / 2;

    const targetX = screenCenterX - width / 2;
    const targetY = screenCenterY - height / 2;

    const deltaX = targetX - originalX.value;
    const deltaY = targetY - originalY.value;

    // Move and scale
    translateX.value = withSpring(deltaX, { damping: 20, stiffness: 150 });
    translateY.value = withSpring(deltaY, { damping: 20, stiffness: 150 });
    scale.value = withSpring(1.2, { damping: 20, stiffness: 150 });

    // Delay book opening
    setTimeout(() => {
      frontRotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      page1Rotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      page2Rotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      page3Rotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      page4Rotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      page5Rotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      page6Rotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
      backRotate.value = withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) });
    }, 200);
  };


  // Format title to fit on book cover
  const formatTitle = (title: string) => {
    if (title.length <= 15) {
      return title;
    } else {
      // For longer titles, add line breaks
      const words = title.split(' ');
      let firstLine = '';
      let secondLine = '';

      // Distribute words to keep lines somewhat balanced
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if ((firstLine + word).length < 15 && firstLine.length < secondLine.length) {
          firstLine += (firstLine ? ' ' : '') + word;
        } else {
          secondLine += (secondLine ? ' ' : '') + word;
        }
      }

      return `${firstLine}\n${secondLine}`;
    }
  };

  // Animated styles for book movement
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });

  // Animated styles for each page
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(frontRotate.value, [0, 1], [0, -160])}deg` }
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(backRotate.value, [0, 1], [0, -20])}deg` }
    ],
  }));

  const page1Style = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(page1Rotate.value, [0, 1], [0, -150])}deg` }
    ],
  }));

  const page2Style = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(page2Rotate.value, [0, 1], [0, -30])}deg` }
    ],
  }));

  const page3Style = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(page3Rotate.value, [0, 1], [0, -140])}deg` }
    ],
  }));

  const page4Style = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(page4Rotate.value, [0, 1], [0, -40])}deg` }
    ],
  }));

  const page5Style = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(page5Rotate.value, [0, 1], [0, -130])}deg` }
    ],
  }));

  const page6Style = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(page6Rotate.value, [0, 1], [0, -50])}deg` }
    ],
  }));

  // Animation to close the book
  const closeBook = () => {
    // Close pages first
    frontRotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    page1Rotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    page2Rotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    page3Rotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    page4Rotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    page5Rotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    page6Rotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    backRotate.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    // Then move back to original position
    setTimeout(() => {
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 150
      });

      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 150
      });
    }, ANIMATION_DURATION);
  };

  // Handle book press
  const handlePress = () => {
    if (isOpen) {
      closeBook();
      setIsOpen(false);
      globalOpenBookId = null;
    } else {
      if (globalOpenBookId) return; // Prevent opening if another book is open
      globalOpenBookId = saga.id;
      openBook();
      setIsOpen(true);
    }
  };

  // Handle long press to navigate
  const handleLongPress = () => {
    onPress();
  };

  // Reset animations when component unmounts
  useEffect(() => {
    frontRotate.value = 0;
    backRotate.value = 0;
    page1Rotate.value = 0;
    page2Rotate.value = 0;
    page3Rotate.value = 0;
    page4Rotate.value = 0;
    page5Rotate.value = 0;
    page6Rotate.value = 0;
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    setIsOpen(false);
    globalOpenBookId = null;
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          position: isOpen ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          zIndex: isOpen ? 999 : 1,
        },
        containerStyle,
      ]}
      ref={animatedRef}
      onLayout={() => {
        // Capture layout after it's rendered
        requestAnimationFrame(() => {
          const measurements = measure(animatedRef);
          if (measurements) {
            originalX.value = measurements.pageX;
            originalY.value = measurements.pageY;
          }
        });
      }}
    >
      <Pressable onPress={handlePress} onLongPress={handleLongPress} delayLongPress={500}>
        <View style={styles.bookWrapper}>
          {/* Book structure */}
          <Animated.View
            style={[
              styles.page,
              styles.front,
              frontStyle,
              {
                backgroundColor: theme.colors.primary,
                width: width,
                height: height
              }
            ]}
          >
            {/* Front cover content */}
            <View style={styles.coverContent}>
              <Icon
                name={saga.icon}
                width={width * 0.3}
                height={height * 0.3}
                color={theme.colors.secondary}
              />

              {/* Title on book cover */}
              <Text
                style={[
                  styles.coverTitle,
                  { color: theme.colors.secondary }
                ]}
                numberOfLines={2}
              >
                {formatTitle(saga.name)}
              </Text>
            </View> {/* 👈 Add this closing tag! */}
          </Animated.View>

          <Animated.View
            style={[
              styles.page,
              styles.page1,
              page1Style,
              { width: width * 0.9, height: height * 0.9 }
            ]}
          />

          <Animated.View
            style={[
              styles.page,
              styles.page2,
              page2Style,
              { width: width * 0.9, height: height * 0.9 }
            ]}
          />

          <Animated.View
            style={[
              styles.page,
              styles.page3,
              page3Style,
              { width: width * 0.9, height: height * 0.9 }
            ]}
          />

          <Animated.View
            style={[
              styles.page,
              styles.page4,
              page4Style,
              { width: width * 0.9, height: height * 0.9 }
            ]}
          />

          <Animated.View
            style={[
              styles.page,
              styles.page5,
              page5Style,
              { width: width * 0.9, height: height * 0.9 }
            ]}
          />

          <Animated.View
            style={[
              styles.page,
              styles.page6,
              page6Style,
              { width: width * 0.9, height: height * 0.9 }
            ]}
          />

          <Animated.View
            style={[
              styles.page,
              styles.back,
              backStyle,
              {
                backgroundColor: theme.colors.primary,
                width: width * 0.9,
                height: height * 0.9
              }
            ]}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'left center',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  front: {
    zIndex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    zIndex: 1,
  },
  page1: {
    backgroundColor: '#efefef',
    zIndex: 7,
  },
  page2: {
    backgroundColor: '#efefef',
    zIndex: 6,
  },
  page3: {
    backgroundColor: '#f5f5f5',
    zIndex: 5,
  },
  page4: {
    backgroundColor: '#f5f5f5',
    zIndex: 4,
  },
  page5: {
    backgroundColor: '#fafafa',
    zIndex: 3,
  },
  page6: {
    backgroundColor: '#fdfdfd',
    zIndex: 2,
  },
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  coverTitle: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    width: '90%',
  }
});

export default AnimatedBookSaga;