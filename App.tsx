// App.tsx

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';

export default function App() {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                await initDatabase();
                setDbInitialized(true);
            } catch (error) {
                console.error('Failed to initialize database:', error);
                setDbError(error instanceof Error ? error.message : 'Unknown database error');
            }
        };

        initializeDatabase();
    }, []);

    if (dbError) {
        // Show a simple error screen if database initialization failed
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
                        Failed to initialize the database. Please restart the app.
                    </Text>
                    <Text style={{ color: 'red', fontSize: 14, textAlign: 'center' }}>
                        Error: {dbError}
                    </Text>
                </View>
            </SafeAreaProvider>
        );
    }

    if (!dbInitialized) {
        // Show a loading screen while database is initializing
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#213448" />
                    <Text style={{ marginTop: 20, fontSize: 16 }}>Initializing database...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <ActionSheetProvider>
                        <NavigationContainer>
                            <AppNavigator />
                        </NavigationContainer>
                    </ActionSheetProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}