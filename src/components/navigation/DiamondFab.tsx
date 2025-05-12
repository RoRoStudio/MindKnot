// src/components/navigation/DiamondFab.tsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';
import { Icon } from '../common/Icon';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FAB_SIZE = 56;
const CORNER_RADIUS = 8;

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

    const menuItems = [
        { icon: 'lightbulb' },
        { icon: 'file-text' },
        { icon: 'link' },
        { icon: 'check' },
    ];

    // rotate icon: closed = + (0°), open = x (45°)
    const iconAnimStyle = useAnimatedStyle(() => {
        const rotate = interpolate(rotation.value, [0, 1], [0, 45]);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    return (
        <View style={styles.fabContainer}>
            {/* Radial items */}
            {menuItems.map((item, index) => {
                const radius = 100;
                const spread = 110; // degrees between first and last item
                const baseAngle = -90; // straight up
                const startAngle = baseAngle - spread / 2;
                const angle = startAngle + (index * spread) / (menuItems.length - 1);
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
                            onPress={() => {
                                console.log(`Pressed ${item.icon}`);
                                closeMenu();
                            }}
                            style={styles.innerDiamond}
                        >
                            <View style={styles.iconContainer}>
                                <View style={styles.uprightIcon}>
                                    <Icon name={item.icon as any} width={20} height={20} color="white" />
                                </View>
                            </View>

                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            {/* Main FAB */}
            <TouchableOpacity
                style={styles.diamond}
                onPress={toggleMenu}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Create new entry"
            >
                <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
                    <View style={styles.uprightIcon}>
                        <Icon name="plus" width={24} height={24} color="white" />
                    </View>
                </Animated.View>

            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
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
        backgroundColor: '#000000',
        borderRadius: CORNER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '45deg' }],
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    menuItem: {
        position: 'absolute',
        width: FAB_SIZE * 0.8,
        height: FAB_SIZE * 0.8,
        backgroundColor: '#000',
        borderRadius: CORNER_RADIUS,
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
});
