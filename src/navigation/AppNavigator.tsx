// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import { BottomSheetProvider, useBottomSheet } from '../contexts/BottomSheetContext';
import { LoopExecutionHeader } from '../components/shared/LoopExecutionHeader';
import { useLoopActions } from '../store/loops';

// Saga and theme screens
import SagaDetailScreen from '../screens/sagas/SagaDetailScreen';
import ThemeInspectorScreen from '../screens/dev/ThemeInspectorScreen';
import ComponentShowcaseScreen from '../screens/dev/ComponentShowcaseScreen';
import TestScreen from '../screens/dev/TestScreen';

// New unified entry screens
import NoteScreen from '../screens/notes/NoteScreen';
import SparkScreen from '../screens/sparks/SparkScreen';
import ActionScreen from '../screens/actions/ActionScreen';
import PathScreen from '../screens/paths/PathScreen';
import LoopScreen from '../screens/loops/LoopScreen';
import { LoopExecutionScreen } from '../screens/loops/LoopExecutionScreen';
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

// App-wide wrapper that includes the loop execution header
const AppWithLoopHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        activeExecution,
        currentActivityWithTemplate,
        currentActivityProgress,
        pauseLoopExecution,
        advanceActivity,
        activityTemplates,
        loadActiveExecution
    } = useLoopActions();

    const [showExecutionScreen, setShowExecutionScreen] = useState(false);

    // Load active execution on app start
    useEffect(() => {
        loadActiveExecution();
    }, [loadActiveExecution]);

    const handleResume = async () => {
        if (activeExecution) {
            await pauseLoopExecution({ loopId: activeExecution.loop.id, isPaused: false });
        }
    };

    const handlePause = async () => {
        if (activeExecution) {
            await pauseLoopExecution({ loopId: activeExecution.loop.id, isPaused: true });
        }
    };

    const handleSkip = async () => {
        if (activeExecution && currentActivityWithTemplate) {
            await advanceActivity({
                loopId: activeExecution.loop.id,
                result: {
                    activityId: currentActivityWithTemplate.activity.id,
                    completed: false,
                    skipped: true,
                    timeSpentSeconds: 0,
                    completedSubActions: [],
                }
            });
        }
    };

    const handleOpenExecution = () => {
        setShowExecutionScreen(true);
    };

    const getCurrentActivityName = () => {
        if (!currentActivityWithTemplate) return 'Loading...';

        const { activity, template } = currentActivityWithTemplate;

        // Handle both LoopActivityInstance and legacy LoopActivity types
        if ('overriddenTitle' in activity) {
            // LoopActivityInstance (new structure)
            return activity.overriddenTitle || template?.title || 'Current Activity';
        } else {
            // LoopActivity (legacy structure)
            return template?.title || 'Current Activity';
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
    });

    return (
        <View style={styles.container}>
            {/* App-wide loop execution header */}
            {activeExecution && currentActivityProgress && (
                <LoopExecutionHeader
                    loop={activeExecution.loop}
                    executionState={activeExecution.executionState}
                    currentActivityName={getCurrentActivityName()}
                    currentIndex={currentActivityProgress.currentIndex}
                    totalActivities={currentActivityProgress.totalActivities}
                    onResume={handleResume}
                    onPause={handlePause}
                    onSkip={handleSkip}
                    onOpenExecution={handleOpenExecution}
                    isPaused={activeExecution.executionState.isPaused}
                />
            )}

            {/* Main app content */}
            {children}

            {/* Loop execution modal */}
            {activeExecution && (
                <LoopExecutionScreen
                    visible={showExecutionScreen}
                    onClose={() => setShowExecutionScreen(false)}
                />
            )}
        </View>
    );
};

// Main navigator component
function MainNavigator() {
    return (
        <AppWithLoopHeader>
            <NavigationConnector />
            <Stack.Navigator
                initialRouteName="Main"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="SagaDetail" component={SagaDetailScreen} />
                <Stack.Screen name="ThemeInspector" component={ThemeInspectorScreen} />
                <Stack.Screen name="ComponentShowcase" component={ComponentShowcaseScreen} />
                <Stack.Screen name="TestScreen" component={TestScreen} />

                {/* Entry screens with create/edit/view capabilities */}
                <Stack.Screen name="NoteScreen" component={NoteScreen} />
                <Stack.Screen name="SparkScreen" component={SparkScreen} />
                <Stack.Screen name="ActionScreen" component={ActionScreen} />
                <Stack.Screen name="PathScreen" component={PathScreen} />
                <Stack.Screen name="LoopScreen" component={LoopScreen} />
            </Stack.Navigator>
        </AppWithLoopHeader>
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