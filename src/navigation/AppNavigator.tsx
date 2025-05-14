// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';


import SagaDetailScreen from '../screens/SagaDetailScreen';
import ThemeInspectorScreen from '../screens/ThemeInspectorScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="SagaDetail" component={SagaDetailScreen} />
            <Stack.Screen name="ThemeInspector" component={ThemeInspectorScreen} />
        </Stack.Navigator>
    );
}