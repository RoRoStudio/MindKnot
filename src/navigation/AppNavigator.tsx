import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from './Routes';
import CanvasScreen from '../screens/CanvasScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName={Routes.Canvas}>
            <Stack.Screen name={Routes.Canvas} component={CanvasScreen} />
            <Stack.Screen name={Routes.Map} component={MapScreen} />
            <Stack.Screen name={Routes.Settings} component={SettingsScreen} />
        </Stack.Navigator>
    );
}
