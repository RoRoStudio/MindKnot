// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import { BottomSheetProvider, useBottomSheet } from '../contexts/BottomSheetContext';
import { useExecution } from '../../features/loops/hooks';
import { ExecutionHeader } from '../../features/loops/components';

// Saga and theme screens
import SagaDetailScreen from '../../features/sagas/screens/SagaDetailScreen';
import ThemeInspectorScreen from '../../screens/dev/ThemeInspectorScreen';
import ComponentShowcaseScreen from '../../screens/dev/ComponentShowcaseScreen';
import TestScreen from '../../screens/dev/TestScreen';

// New unified entry screens
import NoteScreen from '../../features/notes/screens/NoteScreen';
import SparkScreen from '../../features/sparks/screens/SparkScreen';
import ActionScreen from '../../features/actions/screens/ActionScreen';
import PathScreen from '../../features/paths/screens/PathScreen';
// Loop screens
import LoopListScreen from '../../features/loops/screens/LoopListScreen';
import LoopDetailScreen from '../../features/loops/screens/LoopDetailScreen';
import LoopBuilderScreen from '../../features/loops/screens/LoopBuilderScreen';
import LoopExecutionScreen from '../../features/loops/screens/LoopExecutionScreen';
import { RootStackParamList } from '../../shared/types/navigation-types';
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
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const {
        currentExecution,
        isExecuting,
        pauseExecution,
        resumeExecution,
        skipActivity,
    } = useExecution();

    const [showExecutionScreen, setShowExecutionScreen] = useState(false);

    const handleResume = async () => {
        if (currentExecution) {
            await resumeExecution();
        }
    };

    const handlePause = async () => {
        if (currentExecution) {
            await pauseExecution();
        }
    };

    const handleSkip = async () => {
        if (currentExecution) {
            await skipActivity();
        }
    };

    const handleOpenExecution = () => {
        if (currentExecution) {
            // Navigate to the execution screen instead of showing modal
            navigation.navigate('LoopExecutionScreen', { id: currentExecution.loopId });
        }
    };

    const getCurrentActivityName = () => {
        if (!currentExecution || !currentExecution.activities.length) return 'Loading...';

        const currentActivity = currentExecution.activities[currentExecution.currentActivityIndex];
        return currentActivity?.title || 'Current Activity';
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
    });

    return (
        <View style={styles.container}>
            {/* App-wide loop execution header */}
            {currentExecution && isExecuting && (
                <ExecutionHeader
                    execution={currentExecution}
                    currentActivityName={getCurrentActivityName()}
                    onResume={handleResume}
                    onPause={handlePause}
                    onSkip={handleSkip}
                    onOpenExecution={handleOpenExecution}
                />
            )}

            {/* Main app content */}
            {children}
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

                {/* Loop screens */}
                <Stack.Screen name="LoopListScreen" component={LoopListScreen} />
                <Stack.Screen name="LoopDetailScreen" component={LoopDetailScreen} />
                <Stack.Screen name="LoopBuilderScreen" component={LoopBuilderScreen} />
                <Stack.Screen name="LoopExecutionScreen" component={LoopExecutionScreen} />
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