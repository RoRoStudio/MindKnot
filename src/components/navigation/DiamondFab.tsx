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
import { CaptureSubType } from '../../types/capture';

// Import form sheets
import CaptureFormSheet from '../captures/CaptureFormSheet';
import LoopFormSheet from '../loops/LoopFormSheet';
import PathFormSheet from '../paths/PathFormSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FAB_SIZE = 56;

export interface DiamondFabRef {
    closeMenuExternally: () => void;
}

interface DiamondFabProps {
    onPress: () => void;
    onCreateSuccess?: () => void;
}

export const DiamondFab = forwardRef<DiamondFabRef, DiamondFabProps>(({ onPress, onCreateSuccess }, ref) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const progress = useSharedValue(0);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const { theme } = useTheme();
    
    // State for form sheets
    const [captureFormVisible, setCaptureFormVisible] = useState(false);
    const [captureType, setCaptureType] = useState<CaptureSubType>(CaptureSubType.NOTE);
    const [loopFormVisible, setLoopFormVisible] = useState(false);
    const [pathFormVisible, setPathFormVisible] = useState(false);

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

    // Updated menu items
    const menuItems = [
        { icon: 'scroll-text', label: 'Create Capture', action: () => showCaptureForm(CaptureSubType.NOTE) },
        { icon: 'lightbulb', label: 'Create Spark', action: () => showCaptureForm(CaptureSubType.SPARK) },
        { icon: 'check', label: 'Create Action', action: () => showCaptureForm(CaptureSubType.ACTION) },
        { icon: 'sparkles', label: 'Create Reflection', action: () => showCaptureForm(CaptureSubType.REFLECTION) },
        { icon: 'calendar-sync', label: 'Create Loop', action: () => showLoopForm() },
        { icon: 'compass', label: 'Create Path', action: () => showPathForm() },
    ];

    // Show creation forms
    const showCaptureForm = (type: CaptureSubType) => {
        closeMenu();
        setCaptureType(type);
        setCaptureFormVisible(true);
    };

    const showLoopForm = () => {
        closeMenu();
        setLoopFormVisible(true);
    };

    const showPathForm = () => {
        closeMenu();
        setPathFormVisible(true);
    };

    // Handle form success
    const handleFormSuccess = () => {
        if (onCreateSuccess) {
            onCreateSuccess();
        }
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
            {/* Radial menu items */}
            {menuItems.map((item, index) => {
                const radius = 100;
                // Custom angular positioning to create a semi-circle above the FAB
                const angle = -180 + (180 / (menuItems.length - 1)) * index;
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
            </Animated.View>

            {/* Bottom sheets */}
            <CaptureFormSheet
                visible={captureFormVisible}
                onClose={() => setCaptureFormVisible(false)}
                initialSubType={captureType}
                onSuccess={handleFormSuccess}
            />

            <LoopFormSheet
                visible={loopFormVisible}
                onClose={() => setLoopFormVisible(false)}
                onSuccess={handleFormSuccess}
            />

            <PathFormSheet
                visible={pathFormVisible}
                onClose={() => setPathFormVisible(false)}
                onSuccess={handleFormSuccess}
            />
        </View>
    );
});