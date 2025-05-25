// App.tsx

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { View, Text, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ExpandableLoopHeader } from './src/components/shared/ExpandableLoopHeader';
import { LoopExecutionScreen } from './src/screens/loops/LoopExecutionScreen';
import { useExpandableLoopHeader } from './src/hooks/useExpandableLoopHeader';
import { initDatabase } from './src/api/database';
import { useFonts, KantumruyPro_300Light, KantumruyPro_400Regular, KantumruyPro_500Medium, KantumruyPro_600SemiBold, KantumruyPro_700Bold } from '@expo-google-fonts/kantumruy-pro';
import * as SplashScreen from 'expo-splash-screen';
import { lightTheme } from './src/theme/light';

// Main App Content Component (needs to be inside Provider to use hooks)
const AppContent: React.FC = () => {
    const {
        showExecutionScreen,
        hasActiveLoop,
        openExecution,
        closeExecution,
    } = useExpandableLoopHeader();

    return (
        <>
            <AppNavigator />

            {/* Expandable Loop Header - shows when there's an active loop */}
            <ExpandableLoopHeader
                visible={hasActiveLoop}
                onOpenExecution={openExecution}
            />

            {/* Loop Execution Screen - modal overlay */}
            <LoopExecutionScreen
                visible={showExecutionScreen}
                onClose={closeExecution}
            />
        </>
    );
};

export default function App() {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                console.log('Starting database initialization...');
                await initDatabase();
                console.log('Database initialization completed successfully');
                setDbInitialized(true);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
                console.error('Database initialization failed:', error);
                console.error('Error details:', {
                    name: error instanceof Error ? error.name : 'Unknown',
                    message: errorMessage,
                    stack: error instanceof Error ? error.stack : 'No stack trace'
                });
                setDbError(errorMessage);
            }
        };

        initializeDatabase();
    }, []);

    // Load the fonts
    const [fontsLoaded] = useFonts({
        'KantumruyPro-Light': KantumruyPro_300Light,
        'KantumruyPro-Regular': KantumruyPro_400Regular,
        'KantumruyPro-Medium': KantumruyPro_500Medium,
        'KantumruyPro-SemiBold': KantumruyPro_600SemiBold,
        'KantumruyPro-Bold': KantumruyPro_700Bold,
    });

    // Hide splash screen once fonts are loaded
    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (dbError) {
        // Show a simple error screen if database initialization failed
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
                        Failed to initialize the database. Please restart the app.
                    </Text>
                    <Text style={{ color: lightTheme.colors.error, fontSize: 14, textAlign: 'center' }}>
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
                    <ActivityIndicator size="large" color={lightTheme.colors.primary} />
                    <Text style={{ marginTop: 20, fontSize: 16 }}>Initializing database...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    if (!fontsLoaded) {
        // If fonts aren't loaded yet, return null or a loading indicator
        return null;
    }

    return (
        <Provider store={store}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <ThemeProvider>
                        <ActionSheetProvider>
                            <NavigationContainer>
                                <AppContent />
                            </NavigationContainer>
                        </ActionSheetProvider>
                    </ThemeProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </Provider>
    );
}