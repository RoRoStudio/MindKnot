// App.tsx (update the useEffect for database initialization)
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/sqliteService';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Starting database initialization...");
        await initDatabase();
        console.log("Database initialization complete");
        setDbInitialized(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setDbError(error instanceof Error ? error.message : String(error));
      }
    };

    initialize();
  }, []);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Database Error: {dbError}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}