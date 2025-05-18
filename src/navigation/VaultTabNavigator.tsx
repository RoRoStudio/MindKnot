// src/navigation/VaultTabNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import VaultNotesScreen from '../screens/vault/VaultNotesScreen';
import VaultSparksScreen from '../screens/vault/VaultSparksScreen';
import VaultActionsScreen from '../screens/vault/VaultActionsScreen';
import VaultPathsScreen from '../screens/vault/VaultPathsScreen';
import VaultLoopsScreen from '../screens/vault/VaultLoopsScreen';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from '../components/common';
import { getVaultEntryTypes, EntryType } from '../constants/entryTypes';

const Tab = createMaterialTopTabNavigator();

// Custom tab component for pill-shaped tabs with icons
const CustomTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { theme } = useTheme();

    // Create styles using the theme
    const tabStyles = StyleSheet.create({
        tabBarContainer: {
            flexDirection: 'row',
            paddingVertical: 10,
            paddingHorizontal: 8,
            backgroundColor: theme.colors.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            elevation: 2,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        scrollContainer: {
            flexDirection: 'row',
        },
        tabButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            marginRight: 8,
            borderRadius: 16,
            borderWidth: 1,
            // Use fixed width that's just enough for the content
            minWidth: 0,
            maxWidth: 'auto',
        },
        tabIcon: {
            marginRight: 4,
        },
        tabLabel: {
            fontSize: 13,
            fontWeight: '500',
        }
    });

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tabStyles.scrollContainer}
                style={tabStyles.tabBarContainer}
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
                                tabStyles.tabButton,
                                {
                                    backgroundColor: isFocused ? theme.colors.primary : 'transparent',
                                    borderColor: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                                }
                            ]}
                        >
                            <Icon
                                name={iconName}
                                size={16}
                                color={isFocused ? theme.colors.background : theme.colors.textSecondary}
                                style={tabStyles.tabIcon}
                            />
                            <Text
                                style={[
                                    tabStyles.tabLabel,
                                    { color: isFocused ? theme.colors.background : theme.colors.textSecondary }
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
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
                lazy: true, // Only render screens when they are focused
                swipeEnabled: true, // Enable swipe between tabs
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