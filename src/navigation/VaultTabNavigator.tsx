// src/navigation/VaultTabNavigator.tsx
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import VaultNotesScreen from '../screens/vault/VaultNotesScreen';
import VaultSparksScreen from '../screens/vault/VaultSparksScreen';
import VaultActionsScreen from '../screens/vault/VaultActionsScreen';
import VaultPathsScreen from '../screens/vault/VaultPathsScreen';
import VaultLoopsScreen from '../screens/vault/VaultLoopsScreen';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();

export default function VaultTabNavigator() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: { backgroundColor: theme.colors.background },
                tabBarIndicatorStyle: { backgroundColor: theme.colors.primary }
            }}
        >
            <Tab.Screen name="Notes" component={VaultNotesScreen} />
            <Tab.Screen name="Sparks" component={VaultSparksScreen} />
            <Tab.Screen name="Actions" component={VaultActionsScreen} />
            <Tab.Screen name="Paths" component={VaultPathsScreen} />
            <Tab.Screen name="Loops" component={VaultLoopsScreen} />
        </Tab.Navigator>
    );
}