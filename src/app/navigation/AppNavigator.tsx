/**
 * AppNavigator - Main Stack Navigator
 * Includes all screens and navigation structure
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../shared/types/navigation';

// Tab Navigator
import TabNavigator from './TabNavigator';

// Entry Screens
import NoteScreen from '../../features/notes/screens/NoteScreen';
import SparkScreen from '../../features/sparks/screens/SparkScreen';
import ActionScreen from '../../features/actions/screens/ActionScreen';
import PathScreen from '../../features/paths/screens/PathScreen';
import SagaScreen from '../../features/sagas/screens/SagaScreen';

// Loop Screens
import { LoopBuilderScreen, LoopListScreen, LoopExecutionScreen } from '../../features/loops/screens';
import LoopDetailsScreen from '../../features/loops/screens/LoopDetailsScreen';
import LoopSummaryScreen from '../../features/loops/screens/LoopSummaryScreen';

// Dev Screens
import TestScreen from '../../screens/dev/TestScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_right',
            }}
        >
            {/* Main Tab Navigator */}
            <Stack.Screen name="Main" component={TabNavigator} />

            {/* Entry Screens */}
            <Stack.Screen name="NoteScreen" component={NoteScreen} />
            <Stack.Screen name="SparkScreen" component={SparkScreen} />
            <Stack.Screen name="ActionScreen" component={ActionScreen} />
            <Stack.Screen name="PathScreen" component={PathScreen} />
            <Stack.Screen name="SagaScreen" component={SagaScreen} />

            {/* Loop Screens */}
            <Stack.Screen name="LoopListScreen" component={LoopListScreen} />
            <Stack.Screen name="LoopBuilderScreen" component={LoopBuilderScreen} />
            <Stack.Screen name="LoopDetailsScreen" component={LoopDetailsScreen} />
            <Stack.Screen name="LoopExecutionScreen" component={LoopExecutionScreen} />
            <Stack.Screen name="LoopSummaryScreen" component={LoopSummaryScreen} />

            {/* Dev Screens */}
            <Stack.Screen name="TestScreen" component={TestScreen} />
        </Stack.Navigator>
    );
} 