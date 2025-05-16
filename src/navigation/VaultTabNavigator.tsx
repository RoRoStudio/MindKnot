// src/navigation/VaultTabNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import VaultNotesScreen from '../screens/vault/VaultNotesScreen';
import VaultSparksScreen from '../screens/vault/VaultSparksScreen';
import VaultActionsScreen from '../screens/vault/VaultActionsScreen';
import VaultPathsScreen from '../screens/vault/VaultPathsScreen';
import VaultLoopsScreen from '../screens/vault/VaultLoopsScreen';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from '../components/common/Icon';
import { getVaultEntryTypes, EntryType } from '../constants/entryTypes';

const Tab = createMaterialTopTabNavigator();

// Custom tab component for pill-shaped tabs with icons
const CustomTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { theme } = useTheme();

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                style={styles.tabBarContainer}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        typeof options.tabBarLabel === 'string'
                            ? options.tabBarLabel
                            : options.title || route.name;
                    const isFocused = state.index === index;

                    // Find the entry type that matches this route
                    const entryType = getVaultEntryTypes().find(
                        type => type.pluralLabel === route.name
                    );

                    // Get the icon for this entry type
                    const iconName = entryType?.icon || 'file-text';

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
                            onPress={onPress}
                            style={[
                                styles.tabButton,
                                {
                                    backgroundColor: isFocused ? theme.colors.primary : 'transparent',
                                    borderColor: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                                }
                            ]}
                        >
                            <Icon
                                name={iconName}
                                size={18}
                                color={isFocused ? theme.colors.background : theme.colors.textSecondary}
                                style={styles.tabIcon}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: isFocused ? theme.colors.background : theme.colors.textSecondary }
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default function VaultTabNavigator() {
    const { theme } = useTheme();
    const vaultEntryTypes = getVaultEntryTypes();

    // Map entry types to their respective screen components
    const getScreenComponent = (type: EntryType) => {
        switch (type) {
            case EntryType.NOTE:
                return VaultNotesScreen;
            case EntryType.SPARK:
                return VaultSparksScreen;
            case EntryType.ACTION:
                return VaultActionsScreen;
            case EntryType.PATH:
                return VaultPathsScreen;
            case EntryType.LOOP:
                return VaultLoopsScreen;
            default:
                return VaultNotesScreen;
        }
    };

    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: { display: 'none' }, // Hide default tab bar
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

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    scrollContainer: {
        paddingHorizontal: 4,
        paddingStart: 8,
        paddingEnd: 8,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    tabIcon: {
        marginRight: 6,
    },
    tabLabel: {
        fontSize: 14,
    }
});