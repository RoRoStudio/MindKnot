// src/components/navigation/CustomBottomNavBar.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../app/contexts/ThemeContext';
import { Icon, IconName } from './';
import Svg, { Path } from 'react-native-svg';
import { DiamondFab } from './DiamondFab';
import { useThemedStyles } from '../hooks/useThemedStyles';

const { width } = Dimensions.get('window');
const BAR_HEIGHT = 64;
const FAB_SIZE = 56;
const GAP_SIZE = 4; // Gap between FAB and cutout

export function CustomBottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, 0);
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => ({
        container: {
            width: '100%',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
        },
        svg: {
            position: 'absolute',
            bottom: 0,
            left: 0,
        },
        tabsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: BAR_HEIGHT,
            width: '100%',
            // Push tabs down to account for the cutout
            paddingTop: (FAB_SIZE / Math.sqrt(2)) / 2, // Half the diamond's height from top
        },
        tabSection: {
            flexDirection: 'row',
            flex: 1,
        },
        tab: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: BAR_HEIGHT * 0.7, // Only use 70% of the navbar height
            marginTop: BAR_HEIGHT * 0.15, // Push down by 15% of the navbar height
        },
        fabSpace: {
            width: FAB_SIZE + 16, // Space for the FAB plus some margin
        },
        tabContent: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabLabel: {
            fontSize: theme.typography.fontSize.s,
            marginTop: theme.spacing.xs, // Ensure there's enough space between icon and label
            fontWeight: theme.typography.fontWeight.medium,
        },
        activeTabLabel: {
            color: theme.components.bottomNavBar.activeText,
        },
        inactiveTabLabel: {
            color: theme.components.bottomNavBar.inactiveText,
        },
    }));

    const getIcon = (routeName: string, isFocused: boolean) => {
        // Updated icon mapping according to the UI/UX blueprint
        let iconName: IconName;
        switch (routeName) {
            case 'Home': iconName = "house"; break;
            case 'Sagas': iconName = "book-open"; break;
            case 'Vault': iconName = "vault"; break;
            case 'Momentum': iconName = "zap"; break;
            default: iconName = "house"; break;
        }

        return (
            <Icon
                name={iconName}
                width={24}
                height={24}
                color={isFocused
                    ? theme.components.bottomNavBar.activeIcon
                    : theme.components.bottomNavBar.inactiveIcon}
            />
        );
    };

    const createNavBarPath = () => {
        const centerX = width / 2;
        // Add GAP_SIZE to make cutout slightly larger than the FAB
        const diamondSize = (FAB_SIZE / Math.sqrt(2)) + GAP_SIZE;

        // Path starts from top-left corner, and goes clockwise
        let path = `M0,0 `; // Start at top-left

        // Go right to where diamond cutout begins
        path += `H${centerX - diamondSize} `;

        // Create diamond cutout (counter-clockwise)
        path += `L${centerX},${diamondSize} `; // Top to right corner of diamond
        path += `L${centerX + diamondSize},0 `; // Right corner to top

        // Continue to right edge
        path += `H${width} `;

        // Down to bottom-right, left to bottom-left, and back up to close the path
        path += `V${BAR_HEIGHT + bottomInset} H0 Z`;

        return path;
    };

    return (
        <View style={[styles.container, { height: BAR_HEIGHT + bottomInset }]}>
            {/* Background with cutout */}
            <Svg width={width} height={BAR_HEIGHT + bottomInset} style={styles.svg}>
                <Path d={createNavBarPath()} fill={theme.components.bottomNavBar.background} />
            </Svg>

            {/* Tabs container - splitting into left and right sections */}
            <View style={[styles.tabsContainer, { paddingBottom: bottomInset }]}>
                {/* Left section */}
                <View style={styles.tabSection}>
                    {state.routes.slice(0, 2).map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                style={styles.tab}
                                onPress={onPress}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                            >
                                <View style={styles.tabContent}>
                                    {getIcon(route.name, isFocused)}
                                    <Text style={[
                                        styles.tabLabel,
                                        isFocused ? styles.activeTabLabel : styles.inactiveTabLabel
                                    ]}>
                                        {route.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Middle spacer for FAB */}
                <View style={styles.fabSpace} />

                {/* Right section */}
                <View style={styles.tabSection}>
                    {state.routes.slice(2, 4).map((route, index) => {
                        const actualIndex = index + 2; // Adjust index for the right side
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === actualIndex;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                style={styles.tab}
                                onPress={onPress}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                            >
                                <View style={styles.tabContent}>
                                    {getIcon(route.name, isFocused)}
                                    <Text style={[
                                        styles.tabLabel,
                                        isFocused ? styles.activeTabLabel : styles.inactiveTabLabel
                                    ]}>
                                        {route.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* FAB */}
            <DiamondFab onPress={() => console.log('FAB pressed')} />
        </View>
    );
}