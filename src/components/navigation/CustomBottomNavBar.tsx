// src/components/navigation/CustomBottomNavBar.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from '../common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { DiamondFab } from './DiamondFab';

const { width } = Dimensions.get('window');
const BAR_HEIGHT = 56;
const FAB_SIZE = 56;
const CUTOUT_RADIUS = 38;
const CORNER_RADIUS = 8;

export function CustomBottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, 0);

    const getIcon = (routeName: string, isFocused: boolean) => {
        let iconName: "map" | "git-branch" | "sparkles" | "settings" = "map";
        switch (routeName) {
            case 'Home': iconName = "map"; break;
            case 'Sagas': iconName = "git-branch"; break;
            case 'Explore': iconName = "sparkles"; break;
            case 'Settings': iconName = "settings"; break;
        }
        return (
            <Icon
                name={iconName}
                width={24}
                height={24}
                color={isFocused ? '#fff' : 'rgba(255,255,255,0.7)'}
            />
        );
    };

    const createDiamondCutoutPath = () => {
        const centerX = width / 2;
        const diamondSize = CUTOUT_RADIUS * 1.2;
        const cornerOffset = CORNER_RADIUS * 0.6;

        const diamondLeft = { x: centerX - diamondSize, y: diamondSize };
        const diamondRight = { x: centerX + diamondSize, y: diamondSize };

        let path = `M0,0 H${centerX - diamondSize - cornerOffset} `;
        path += `Q${centerX - diamondSize},0 ${diamondLeft.x + cornerOffset},${diamondLeft.y - cornerOffset} `;
        path += `Q${centerX},${diamondSize + cornerOffset} ${diamondRight.x - cornerOffset},${diamondRight.y - cornerOffset} `;
        path += `Q${centerX + diamondSize},0 ${centerX + diamondSize + cornerOffset},0 `;
        path += `H${width} V${BAR_HEIGHT + bottomInset} H0 Z`;
        return path;
    };

    return (
        <View style={[styles.container, { height: BAR_HEIGHT + bottomInset }]}>
            {/* Background with cutout */}
            <Svg width={width} height={BAR_HEIGHT + bottomInset} style={styles.svg}>
                <Path d={createDiamondCutoutPath()} fill="#6102ED" />
            </Svg>

            {/* Tabs including fab placeholder */}
            <View style={[styles.tabsContainer, { paddingBottom: bottomInset }]}>
                {state.routes.map((route, index) => {
                    const isFabSlot = index === 1;
                    if (isFabSlot) {
                        return <View key="fab-space" style={{ width: FAB_SIZE }} />;
                    }

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
                        >
                            <View style={styles.tabContent}>
                                {getIcon(route.name, isFocused)}
                                <Text style={[
                                    styles.tabLabel,
                                    { color: isFocused ? '#fff' : 'rgba(255,255,255,0.7)' }
                                ]}>
                                    {route.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* FAB */}
            <DiamondFab onPress={() => console.log('FAB pressed')} />
        </View>
    );
}

const styles = StyleSheet.create({
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
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: BAR_HEIGHT,
        width: '100%',
    },
    tab: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 4,
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
    },
});
