// src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/home/HomeScreen';
import SagaScreen from '../../features/sagas/screens/SagaScreen';
import VaultScreen from '../../shared/screens/VaultScreen';
import MomentumScreen from '../../screens/momentum/MomentumScreen';
import { CustomBottomNavBar } from '../../shared/components';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomBottomNavBar {...props} />}
            screenOptions={{
                headerShown: false
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Sagas" component={SagaScreen} />
            <Tab.Screen name="Vault" component={VaultScreen} />
            <Tab.Screen name="Momentum" component={MomentumScreen} />
        </Tab.Navigator>
    );
}