// src/components/sagas/AnimatedBookSaga.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Icon, IconName } from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../common/Typography';

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

const OPEN_ANIMATION_DURATION = 600;
const ZOOM_ANIMATION_DURATION = 500;
const PERSPECTIVE = 800;

export const AnimatedBookSaga: React.FC<AnimatedBookSagaProps> = ({
  saga,
  width,
  height,
  onPress
}) => {
  const { theme } = useTheme();

  // Animation values
  const leftCoverRotate = useSharedValue(0);
  const rightCoverRotate = useSharedValue(0);
  const bookScale = useSharedValue(1);
  const bookOpacity = useSharedValue(1);
  const pagesOpacity = useSharedValue(0);
  const pagesScale = useSharedValue(0.7);
  const pagesTilt = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const shimmerOpacity = useSharedValue(0);

  // Book cover animations
  const leftCoverStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: PERSPECTIVE },
        { rotateY: `${interpolate(leftCoverRotate.value, [0, 1], [0, -105])}deg` },
      ],
    };
  });

  const rightCoverStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: PERSPECTIVE },
        { rotateY: `${interpolate(rightCoverRotate.value, [0, 1], [0, 105])}deg` },
      ],
    };
  });

  // Book container animations
  const bookContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: bookOpacity.value,
      transform: [
        { scale: bookScale.value },
      ],
    };
  });

  // Pages animations
  const pagesStyle = useAnimatedStyle(() => {
    return {
      opacity: pagesOpacity.value,
      transform: [
        { scale: pagesScale.value },
        { rotateX: `${pagesTilt.value}deg` }
      ]
    };
  });

  // Icon animations
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
      ],
    };
  });

  // Shimmer effect animation
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: shimmerOpacity.value,
    };
  });

  // Handle the book opening animation sequence
  const handlePress = () => {
    // First animate the book opening
    leftCoverRotate.value = withTiming(1, {
      duration: OPEN_ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });
    rightCoverRotate.value = withTiming(1, {
      duration: OPEN_ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad)
    });

    // Show the pages with a slight delay
    pagesOpacity.value = withDelay(
      OPEN_ANIMATION_DURATION * 0.3,
      withTiming(1, { duration: OPEN_ANIMATION_DURATION * 0.4 })
    );

    // Animate pages scaling up
    pagesScale.value = withDelay(
      OPEN_ANIMATION_DURATION * 0.3,
      withTiming(1, { duration: OPEN_ANIMATION_DURATION * 0.7 })
    );

    // Create a slight page tilt animation
    pagesTilt.value = withSequence(
      withDelay(
        OPEN_ANIMATION_DURATION * 0.4,
        withTiming(8, { duration: OPEN_ANIMATION_DURATION * 0.2 })
      ),
      withTiming(0, { duration: OPEN_ANIMATION_DURATION * 0.2 })
    );

    // Shrink the icon
    iconScale.value = withDelay(
      OPEN_ANIMATION_DURATION * 0.3,
      withTiming(0.6, { duration: OPEN_ANIMATION_DURATION * 0.3 })
    );

    // Add a shimmer effect
    shimmerOpacity.value = withSequence(
      withDelay(
        OPEN_ANIMATION_DURATION * 0.6,
        withTiming(0.7, { duration: OPEN_ANIMATION_DURATION * 0.2 })
      ),
      withTiming(0, { duration: OPEN_ANIMATION_DURATION * 0.2 })
    );

    // After book is open, animate the zoom effect and navigate
    setTimeout(() => {
      // Scale up the entire book
      bookScale.value = withTiming(1.5, {
        duration: ZOOM_ANIMATION_DURATION,
        easing: Easing.inOut(Easing.cubic)
      });

      // Fade out the book as it gets larger
      bookOpacity.value = withTiming(0, {
        duration: ZOOM_ANIMATION_DURATION,
        easing: Easing.inOut(Easing.cubic)
      }, () => {
        // After animation completes, navigate to saga details
        runOnJS(onPress)();
      });
    }, OPEN_ANIMATION_DURATION + 100);
  };

  // Reset animations when component mounts
  useEffect(() => {
    leftCoverRotate.value = 0;
    rightCoverRotate.value = 0;
    bookScale.value = 1;
    bookOpacity.value = 1;
    pagesOpacity.value = 0;
    pagesScale.value = 0.7;
    iconScale.value = 1;
    shimmerOpacity.value = 0;
  }, []);

  return (
    <Pressable onPress={handlePress} style={[styles.container, { width, height }]}>
      <Animated.View style={[styles.bookContainer, bookContainerStyle]}>
        {/* Left cover (front) */}
        <Animated.View
          style={[
            styles.bookCover,
            styles.leftCover,
            leftCoverStyle,
            { backgroundColor: theme.colors.primary, width: width * 0.95, height: height * 0.95 }
          ]}
        >
          {/* Cover decoration */}
          <View style={styles.coverBorder}>
            <View style={[styles.coverDecoration, { backgroundColor: theme.colors.primaryLight }]} />
          </View>
        </Animated.View>

        {/* Book spine */}
        <View style={[styles.bookSpine, { backgroundColor: theme.colors.primaryDark, height: height * 0.95 }]}>
          <View style={styles.spineDecoration} />
        </View>

        {/* Pages */}
        <Animated.View
          style={[
            styles.pages,
            pagesStyle,
            { width: width * 0.88, height: height * 0.88, backgroundColor: theme.colors.white }
          ]}
        >
          {/* Page content */}
          <View style={styles.pageLines}>
            <View style={[styles.pageLine, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.pageLine, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.pageLine, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.pageLine, { backgroundColor: theme.colors.border }]} />
          </View>
        </Animated.View>

        {/* Right cover (back) */}
        <Animated.View
          style={[
            styles.bookCover,
            styles.rightCover,
            rightCoverStyle,
            { backgroundColor: theme.colors.primary, width: width * 0.95, height: height * 0.95 }
          ]}
        >
          {/* Cover decoration */}
          <View style={styles.coverBorder}>
            <View style={[styles.coverDecoration, { backgroundColor: theme.colors.primaryLight }]} />
          </View>
        </Animated.View>

        {/* Icon centered on the book */}
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <View style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.primaryLight }
          ]}>
            <Icon
              name={saga.icon}
              width={width * 0.35}
              height={height * 0.35}
              color={theme.colors.onPrimary}
            />
          </View>
        </Animated.View>

        {/* Shimmer effect */}
        <Animated.View
          style={[
            styles.shimmer,
            shimmerStyle,
            { width: width * 1.5, height: height * 1.5 }
          ]}
        />
      </Animated.View>

      {/* Title below the book */}
      <Typography
        variant="body2"
        style={[styles.title, { color: theme.colors.textPrimary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {saga.name}
      </Typography>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  bookContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bookCover: {
    position: 'absolute',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  leftCover: {
    zIndex: 2,
    left: '2%',
    transformOrigin: 'left center',
  },
  rightCover: {
    zIndex: 2,
    right: '2%',
    transformOrigin: 'right center',
  },
  coverBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverDecoration: {
    width: '85%',
    height: '93%',
    borderRadius: 2,
    opacity: 0.3,
  },
  bookSpine: {
    position: 'absolute',
    width: 8,
    left: '50%',
    marginLeft: -4,
    borderRadius: 2,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spineDecoration: {
    width: '60%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    marginVertical: 2,
  },
  pages: {
    position: 'absolute',
    borderRadius: 2,
    zIndex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageLines: {
    width: '80%',
    alignItems: 'center',
  },
  pageLine: {
    width: '100%',
    height: 1,
    marginVertical: 10,
    opacity: 0.3,
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    position: 'absolute',
    backgroundColor: 'white',
    zIndex: 10,
    opacity: 0,
    borderRadius: 100,
  },
  title: {
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  }
});

export default AnimatedBookSaga;