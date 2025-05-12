// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ActionSheetProvider>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </ActionSheetProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
