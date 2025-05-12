// src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SagaScreen from '../screens/SagaScreen';
import { CustomBottomNavBar } from '../components/navigation/CustomBottomNavBar';

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
            <Tab.Screen name="Explore" component={SagaScreen} />
            <Tab.Screen name="Settings" component={SagaScreen} />
        </Tab.Navigator>
    );
}