// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Saga and theme screens
import SagaDetailScreen from '../screens/SagaDetailScreen';
import ThemeInspectorScreen from '../screens/ThemeInspectorScreen';

// New unified entry screens
import NoteScreen from '../screens/NoteScreen';
import SparkScreen from '../screens/SparkScreen';
import ActionScreen from '../screens/ActionScreen';
import PathScreen from '../screens/PathScreen';
import LoopScreen from '../screens/LoopScreen';

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

            {/* Entry screens with create/edit/view capabilities */}
            <Stack.Screen name="NoteScreen" component={NoteScreen} />
            <Stack.Screen name="SparkScreen" component={SparkScreen} />
            <Stack.Screen name="ActionScreen" component={ActionScreen} />
            <Stack.Screen name="PathScreen" component={PathScreen} />
            <Stack.Screen name="LoopScreen" component={LoopScreen} />
        </Stack.Navigator>
    );
}