// src/components/navigation/DiamondFab.tsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    Alert,
} from 'react-native';
import { Icon } from '../common/Icon';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    useAnimatedGestureHandler,
    runOnJS,
} from 'react-native-reanimated';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FAB_SIZE = 56;

export interface DiamondFabRef {
    closeMenuExternally: () => void;
}

interface DiamondFabProps {
    onPress: () => void;
}

export const DiamondFab = forwardRef<DiamondFabRef, DiamondFabProps>(({ onPress }, ref) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const progress = useSharedValue(0);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const { theme } = useTheme();
    const navigation = useNavigation();

    const styles = useStyles((theme) => ({
        fabContainer: {
            position: 'absolute',
            width: FAB_SIZE,
            height: FAB_SIZE,
            justifyContent: 'center',
            alignItems: 'center',
            top: -FAB_SIZE / 2,
            left: '50%',
            marginLeft: -FAB_SIZE / 2,
            zIndex: 1001,
        },
        diamond: {
            width: FAB_SIZE,
            height: FAB_SIZE,
            backgroundColor: theme.components.bottomNavBar.fabBackground,
            borderRadius: theme.shape.radius.m,
            justifyContent: 'center',
            alignItems: 'center',
            ...Platform.select({
                ios: {
                    shadowColor: theme.colors.black,
                    shadowOffset: theme.elevation.z4.shadowOffset,
                    shadowOpacity: theme.elevation.z4.shadowOpacity,
                    shadowRadius: theme.elevation.z4.shadowRadius,
                },
                android: {
                    elevation: theme.elevation.z4.elevation,
                },
            }),
        },
        menuItem: {
            position: 'absolute',
            width: FAB_SIZE * 0.90,
            height: FAB_SIZE * 0.90,
            backgroundColor: theme.components.bottomNavBar.menuItemBackground,
            borderRadius: theme.shape.radius.m,
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerDiamond: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ rotate: '45deg' }],
        },
        iconContainer: {
            transform: [{ rotate: '-45deg' }],
        },
        uprightIcon: {
            transform: [{ rotate: '-45deg' }],
        },
    }));

    const toggleMenu = () => {
        const isOpening = !menuOpen;
        setMenuOpen(isOpening);
        progress.value = withTiming(isOpening ? 1 : 0, { duration: 300 });
        rotation.value = withTiming(isOpening ? 1 : 0, { duration: 300 });
    };

    const closeMenu = () => {
        setMenuOpen(false);
        progress.value = withTiming(0, { duration: 300 });
        rotation.value = withTiming(0, { duration: 300 });
    };

    useImperativeHandle(ref, () => ({
        closeMenuExternally: closeMenu,
    }));

    // Updated menu items according to the UI/UX blueprint
    const menuItems = [
        { icon: 'scroll-text', label: 'Create Capture', action: () => navigateToCreationScreen('Capture') },
        { icon: 'calendar-sync', label: 'Create Loop', action: () => navigateToCreationScreen('Loop') },
        { icon: 'compass', label: 'Create Path', action: () => navigateToCreationScreen('Path') },
        { icon: 'circle-help', label: 'Help', action: () => showHelpPlaceholder() },
    ];

    const navigateToCreationScreen = (type: string) => {
        console.log(`Navigate to create ${type}`);
        closeMenu();
        // Future implementation: navigation.navigate(`Create${type}`);

        // For now, show an alert as a placeholder
        Alert.alert(
            `Create ${type}`,
            `This will navigate to the ${type} creation screen in the future update.`,
            [{ text: 'OK' }]
        );
    };

    const showHelpPlaceholder = () => {
        closeMenu();
        Alert.alert(
            "Help Feature",
            "This help feature will be implemented in a future update.",
            [{ text: 'OK' }]
        );
    };

    // rotate icon: closed = + (0°), open = x (45°)
    const iconAnimStyle = useAnimatedStyle(() => {
        const rotate = interpolate(rotation.value, [0, 1], [0, 45]);
        return {
            transform: [
                { rotate: '-45deg' },  // cancel diamond rotation
                { rotate: `${rotate}deg` }, // apply plus-to-x rotation
            ],
        };
    });


    const fabAnimStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: '45deg' },
            { scale: scale.value },
        ],
    }));




    return (
        <View style={styles.fabContainer}>
            {/* Radial items */}
            {menuItems.map((item, index) => {
                const radius = 100;
                const spread = 110; // degrees between first and last item
                const baseAngle = -90; // straight up
                const startAngle = baseAngle - spread / 2;
                // Custom spacing bias for 4 items: tweak as needed
                const angleOffsets = [-150, -112, -68, -30]; // better manual layout

                const angle = angleOffsets[index];

                const angleRad = (angle * Math.PI) / 180;

                const animatedStyle = useAnimatedStyle(() => {
                    const x = progress.value * radius * Math.cos(angleRad);
                    const y = progress.value * radius * Math.sin(angleRad);
                    return {
                        transform: [
                            { translateX: x },
                            { translateY: y },
                            { rotate: '45deg' },
                        ],
                        opacity: progress.value,
                    };
                });

                return (
                    <Animated.View key={index} style={[styles.menuItem, animatedStyle]}>
                        <TouchableOpacity
                            onPress={item.action}
                            style={styles.innerDiamond}
                            accessibilityLabel={item.label}
                        >
                            <View style={styles.iconContainer}>
                                <View style={styles.uprightIcon}>
                                    <Icon
                                        name={item.icon as any}
                                        width={20}
                                        height={20}
                                        color={theme.components.bottomNavBar.menuItemIcon}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            {/* Main FAB */}
            <Animated.View style={[styles.diamond, fabAnimStyle]}>
                <TouchableOpacity
                    style={styles.innerDiamond}
                    onPress={toggleMenu}
                    activeOpacity={1}
                    onPressIn={() => {
                        scale.value = withTiming(0.9, { duration: 100, easing: Easing.out(Easing.quad) });
                    }}
                    onPressOut={() => {
                        scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Create new entry"
                >
                    <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
                        <View style={styles.uprightIcon}>
                            <Icon
                                name="plus"
                                width={24}
                                height={24}
                                color={theme.components.bottomNavBar.fabIcon}
                            />
                        </View>
                    </Animated.View>


                </TouchableOpacity>
            </Animated.View >

        </View >
    );
});