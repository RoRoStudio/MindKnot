// src/components/sagas/AnimatedBookSaga.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  useAnimatedRef,
  runOnJS
} from 'react-native-reanimated';
import { Icon, IconName } from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';

// Keep track of the currently open book ID
let globalOpenBookId: string | null = null;

// Interface for the background overlay component's props
interface OverlayProps {
  visible: boolean;
  onPress: () => void;
}

// Component for the semi-transparent background overlay
const BackgroundOverlay: React.FC<OverlayProps> = ({ visible, onPress }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 0.7 : 0, { duration: 300 });
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle]}
      pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable
        style={{ width: '100%', height: '100%' }}
        onPress={onPress}
      />
    </Animated.View>
  );
};

interface AnimatedBookSagaProps {
  saga: {
    id: string;
    name: string;
    icon: IconName;
  };
  width: number;
  height: number;
  onPress: () => void;
  setOverlay: (overlay: React.ReactNode) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION_DURATION = 500;
const PERSPECTIVE = 1200;
const SCALE_FACTOR = 1.2; // Scale factor when book is open

export const AnimatedBookSaga: React.FC<AnimatedBookSagaProps> = ({
  saga,
  width,
  height,
  onPress,
  setOverlay
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);

  // Reference to the animated view
  const animatedRef = useAnimatedRef<View>();
  const viewRef = useRef<View>(null);

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

  // Handle layout changes
  const handleLayout = (event: LayoutChangeEvent) => {
    if (viewRef.current) {
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        console.log(`Book position measured: ${pageX}, ${pageY}`);
        setPosition({ x: pageX, y: pageY });
      });
    }
  };

  // Function to close book when overlay is tapped
  const handleOverlayPress = () => {
    if (isOpen) {
      handlePress();
    }
  };

  // Update the overlay when opened/closed
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Show overlay when book is open
      const overlay = (
        <BackgroundOverlay visible={true} onPress={handleOverlayPress} />
      );
      setOverlay(overlay);
    } else if (!isOpen && !isClosing) {
      // Hide overlay when book is fully closed
      setOverlay(null);
    }
  }, [isOpen, isClosing]);

  // Animate book to center and open
  const openBook = () => {
    console.log("Opening book:", saga.name);

    // Calculate the center of screen
    const screenCenterX = SCREEN_WIDTH / 2;
    const screenCenterY = SCREEN_HEIGHT / 2;

    // *** IMPROVED CENTERING CALCULATION ***
    // For proper centering, the LEFT EDGE (spine) should be exactly at screen center
    const targetX = screenCenterX;

    // Vertically center the book
    const scaledHeight = height * SCALE_FACTOR;
    const targetY = screenCenterY - (scaledHeight / 2);

    // Calculate the difference between current position and target
    const offsetX = targetX - position.x;
    const offsetY = targetY - position.y;

    console.log(`Book position: ${position.x}, ${position.y}`);
    console.log(`Target position (spine at center): ${targetX}, ${targetY}`);
    console.log(`Moving by: ${offsetX}, ${offsetY}`);

    // Animate the book to the position
    translateX.value = withSpring(offsetX, { damping: 20, stiffness: 150 });
    translateY.value = withSpring(offsetY, { damping: 20, stiffness: 150 });
    scale.value = withSpring(SCALE_FACTOR, { damping: 20, stiffness: 150 });

    console.log("Started position animation");

    // Delay opening the pages
    setTimeout(() => {
      console.log("Starting page animations");

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

  // Callback for when closing animation is complete
  const onCloseAnimationComplete = () => {
    setIsClosing(false);
    setIsOpen(false);
    globalOpenBookId = null;
  };

  // Animation to close the book
  const closeBook = () => {
    console.log("Closing book:", saga.name);
    setIsClosing(true);

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
      console.log("Resetting position");
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 150
      }, (finished) => {
        if (finished) {
          runOnJS(onCloseAnimationComplete)();
        }
      });

      translateY.value = withSpring(0, {
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
    console.log("Book pressed: ", saga.name, isOpen ? "currently open" : "currently closed");

    if (isOpen) {
      closeBook();
    } else {
      if (globalOpenBookId) {
        console.log("Another book is already open:", globalOpenBookId);
        return; // Prevent opening if another book is open
      }

      // Measure position again to ensure we have the latest
      if (viewRef.current) {
        viewRef.current.measure((x, y, width, height, pageX, pageY) => {
          console.log(`Book position before opening: ${pageX}, ${pageY}`);
          setPosition({ x: pageX, y: pageY });

          // Now open the book with the latest position
          globalOpenBookId = saga.id;
          setIsOpen(true);
          openBook();
        });
      } else {
        // Fallback if ref isn't available
        globalOpenBookId = saga.id;
        setIsOpen(true);
        openBook();
      }
    }
  };

  // Handle long press to navigate
  const handleLongPress = () => {
    onPress();
  };

  // Reset animations when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup if component is unmounted while open
      if ((isOpen || isClosing) && globalOpenBookId === saga.id) {
        globalOpenBookId = null;
        setOverlay(null);
      }
    };
  }, [isOpen, isClosing, saga.id]);

  // Calculate z-index for the book
  const zIndexValue = isOpen || isClosing ? 1000 : 1;

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          position: isOpen || isClosing ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          zIndex: zIndexValue, // Very high z-index for opened book
        },
        containerStyle,
      ]}
      ref={animatedRef}
      onLayout={handleLayout}
    >
      <View
        ref={viewRef}
        style={{ width: '100%', height: '100%' }}
      >
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={{ width: '100%', height: '100%' }}
        >
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
              </View>
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
          </View>
        </Pressable>
      </View>
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
    width: '100%',
    height: '100%',
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
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 990, // Below the open book (1000) but above closed books (1)
  }
});

export default AnimatedBookSaga;