import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CanvasScreen from '../screens/CanvasScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Icon } from '../components/common/Icon';
import { lightTheme } from '../theme/light';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: RouteProp<Record<string, object | undefined>, string> }) => {
                return {
                    headerStyle: { backgroundColor: lightTheme.background },
                    headerTitleStyle: { color: lightTheme.textPrimary },
                    tabBarStyle: { backgroundColor: lightTheme.background },
                    tabBarActiveTintColor: lightTheme.primary,
                    tabBarInactiveTintColor: lightTheme.textSecondary,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
                        const name = route.name === 'Canvas' ? 'map' : 'settings';
                        return <Icon name={name} width={size} height={size} stroke={color} />;
                    },
                } as BottomTabNavigationOptions;
            }}
        >
            <Tab.Screen name="Canvas" component={CanvasScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}
