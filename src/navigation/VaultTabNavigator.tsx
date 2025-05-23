// src/navigation/VaultTabNavigator.tsx
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import VaultNotesScreen from '../screens/vault/VaultNotesScreen';
import VaultSparksScreen from '../screens/vault/VaultSparksScreen';
import VaultActionsScreen from '../screens/vault/VaultActionsScreen';
import VaultPathsScreen from '../screens/vault/VaultPathsScreen';
import VaultLoopsScreen from '../screens/vault/VaultLoopsScreen';
import { Icon, IconName } from '../components/common';
import { getVaultEntryTypes, EntryType } from '../constants/entryTypes';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

// Define interface for tab item props
interface TabItemProps {
    label: string;
    icon: IconName;
    active: boolean;
    onPress: () => void;
}

// Define interface for tab data
interface TabData {
    id: string;
    label: string;
    icon: IconName;
    active: boolean;
    index: number;
}

// Pill-shaped tab item with icon in center
const TabItem = React.memo<TabItemProps>(({ icon, active, onPress }) => {
    const { theme } = useTheme();

    const tabItemStyles = {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderRadius: 50,
        marginRight: 8,
        width: 50,
        height: 30,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                tabItemStyles,
                active && { backgroundColor: theme.colors.primary }
            ]}
            activeOpacity={0.7}
        >
            <Icon
                name={icon}
                size={18}
                color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
            />
        </TouchableOpacity>
    );
});

// Tab bar that fits 5 tabs on screen with slight scrolling if needed
function SimpleTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
    const { theme } = useTheme();
    const flatListRef = useRef<FlatList<TabData>>(null);
    const tabWidth = Math.min(80, SCREEN_WIDTH / 5 - 16); // Calculate tab width to fit 5 tabs with some spacing

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
            paddingVertical: 8,
            paddingHorizontal: 12,
        },
        tabsContainer: {
            paddingHorizontal: 12,
            justifyContent: 'space-between',
        },
        tabItem: {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
            marginRight: 8,
            width: 50,
            height: 30,
        },
        tabsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
        },
    });

    // Scroll to active tab when index changes
    useEffect(() => {
        if (flatListRef.current && state.index > 0) {
            flatListRef.current.scrollToIndex({
                index: state.index,
                animated: true,
                viewPosition: 0.5
            });
        }
    }, [state.index]);

    const tabs: TabData[] = state.routes.map((route, index) => {
        const entryType = getVaultEntryTypes().find(
            type => type.pluralLabel === route.name
        );

        return {
            id: route.key,
            label: route.name,
            icon: (entryType?.icon as IconName) || 'file-text',
            active: state.index === index,
            index: index,
        };
    });

    const handleTabPress = (index: number) => {
        navigation.navigate(state.routes[index].name);
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabsRow}>
                {tabs.map((item) => (
                    <TabItem
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        active={item.active}
                        onPress={() => handleTabPress(item.index)}
                    />
                ))}
            </View>
        </View>
    );
}

export default function VaultTabNavigator() {
    const vaultEntryTypes = getVaultEntryTypes();

    // Map entry types to screen components
    const getScreenComponent = (type: EntryType) => {
        switch (type) {
            case EntryType.NOTE: return VaultNotesScreen;
            case EntryType.SPARK: return VaultSparksScreen;
            case EntryType.ACTION: return VaultActionsScreen;
            case EntryType.PATH: return VaultPathsScreen;
            case EntryType.LOOP: return VaultLoopsScreen;
            default: return VaultNotesScreen;
        }
    };

    return (
        <Tab.Navigator
            tabBar={(props) => <SimpleTabBar {...props} />}
            screenOptions={{
                tabBarStyle: { display: 'none' },
                lazy: true,
                swipeEnabled: true,
            }}
        >
            {vaultEntryTypes.map(entryType => (
                <Tab.Screen
                    key={entryType.type}
                    name={entryType.pluralLabel}
                    component={getScreenComponent(entryType.type)}
                />
            ))}
        </Tab.Navigator>
    );
}