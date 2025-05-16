// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import { BottomSheetProvider, useBottomSheet } from '../contexts/BottomSheetContext';

// Saga and theme screens
import SagaDetailScreen from '../screens/SagaDetailScreen';
import ThemeInspectorScreen from '../screens/ThemeInspectorScreen';
import ComponentShowcaseScreen from '../screens/ComponentShowcaseScreen';

// New unified entry screens
import NoteScreen from '../screens/NoteScreen';
import SparkScreen from '../screens/SparkScreen';
import ActionScreen from '../screens/ActionScreen';
import PathScreen from '../screens/PathScreen';
import LoopScreen from '../screens/LoopScreen';
import { RootStackParamList } from '../types/navigation-types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

// This component will connect navigation with the BottomSheetContext
const NavigationConnector: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { setNavigationCallback } = useBottomSheet();

    useEffect(() => {
        // Set up navigation callback for BottomSheetContext
        setNavigationCallback((screen, params) => {
            navigation.navigate(screen, params);
        });
    }, [navigation, setNavigationCallback]);

    return null;
};

// Main navigator component
function MainNavigator() {
    return (
        <>
            <NavigationConnector />
            <Stack.Navigator
                initialRouteName="Main"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="SagaDetail" component={SagaDetailScreen} />
                <Stack.Screen name="ThemeInspector" component={ThemeInspectorScreen} />
                <Stack.Screen name="ComponentShowcase" component={ComponentShowcaseScreen} />

                {/* Entry screens with create/edit/view capabilities */}
                <Stack.Screen name="NoteScreen" component={NoteScreen} />
                <Stack.Screen name="SparkScreen" component={SparkScreen} />
                <Stack.Screen name="ActionScreen" component={ActionScreen} />
                <Stack.Screen name="PathScreen" component={PathScreen} />
                <Stack.Screen name="LoopScreen" component={LoopScreen} />
            </Stack.Navigator>
        </>
    );
}

// Wrap the main navigator with BottomSheetProvider
export default function AppNavigator() {
    return (
        <BottomSheetProvider>
            <MainNavigator />
        </BottomSheetProvider>
    );
}