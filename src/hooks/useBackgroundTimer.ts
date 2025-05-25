import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackgroundTimerState {
    isRunning: boolean;
    startTime: string;
    elapsedSeconds: number;
    activityId: string;
}

const BACKGROUND_TIMER_KEY = '@mindknot_background_timer';

export const useBackgroundTimer = () => {
    const [isBackgroundActive, setIsBackgroundActive] = useState(false);
    const appState = useRef(AppState.currentState);
    const backgroundStartTime = useRef<string | null>(null);

    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                await handleAppForeground();
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                // App has gone to the background
                await handleAppBackground();
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
    }, []);

    const handleAppBackground = async () => {
        try {
            const timerState = await AsyncStorage.getItem(BACKGROUND_TIMER_KEY);
            if (timerState) {
                const state: BackgroundTimerState = JSON.parse(timerState);
                if (state.isRunning) {
                    backgroundStartTime.current = new Date().toISOString();
                    await AsyncStorage.setItem(BACKGROUND_TIMER_KEY, JSON.stringify({
                        ...state,
                        backgroundStartTime: backgroundStartTime.current
                    }));
                }
            }
        } catch (error) {
            console.error('Error handling app background:', error);
        }
    };

    const handleAppForeground = async () => {
        try {
            const timerState = await AsyncStorage.getItem(BACKGROUND_TIMER_KEY);
            if (timerState) {
                const state: BackgroundTimerState & { backgroundStartTime?: string } = JSON.parse(timerState);
                if (state.isRunning && state.backgroundStartTime) {
                    const backgroundDuration = Math.floor(
                        (new Date().getTime() - new Date(state.backgroundStartTime).getTime()) / 1000
                    );

                    // Update elapsed time
                    const updatedState = {
                        ...state,
                        elapsedSeconds: state.elapsedSeconds + backgroundDuration,
                        backgroundStartTime: undefined
                    };

                    await AsyncStorage.setItem(BACKGROUND_TIMER_KEY, JSON.stringify(updatedState));
                    setIsBackgroundActive(false);

                    return {
                        activityId: state.activityId,
                        additionalElapsed: backgroundDuration,
                        totalElapsed: updatedState.elapsedSeconds
                    };
                }
            }
        } catch (error) {
            console.error('Error handling app foreground:', error);
        }
        return null;
    };

    const startBackgroundTimer = async (activityId: string, currentElapsed: number = 0) => {
        try {
            const timerState: BackgroundTimerState = {
                isRunning: true,
                startTime: new Date().toISOString(),
                elapsedSeconds: currentElapsed,
                activityId
            };
            await AsyncStorage.setItem(BACKGROUND_TIMER_KEY, JSON.stringify(timerState));
            setIsBackgroundActive(true);
        } catch (error) {
            console.error('Error starting background timer:', error);
        }
    };

    const stopBackgroundTimer = async () => {
        try {
            await AsyncStorage.removeItem(BACKGROUND_TIMER_KEY);
            setIsBackgroundActive(false);
            backgroundStartTime.current = null;
        } catch (error) {
            console.error('Error stopping background timer:', error);
        }
    };

    const pauseBackgroundTimer = async () => {
        try {
            const timerState = await AsyncStorage.getItem(BACKGROUND_TIMER_KEY);
            if (timerState) {
                const state: BackgroundTimerState = JSON.parse(timerState);
                await AsyncStorage.setItem(BACKGROUND_TIMER_KEY, JSON.stringify({
                    ...state,
                    isRunning: false
                }));
            }
        } catch (error) {
            console.error('Error pausing background timer:', error);
        }
    };

    const resumeBackgroundTimer = async () => {
        try {
            const timerState = await AsyncStorage.getItem(BACKGROUND_TIMER_KEY);
            if (timerState) {
                const state: BackgroundTimerState = JSON.parse(timerState);
                await AsyncStorage.setItem(BACKGROUND_TIMER_KEY, JSON.stringify({
                    ...state,
                    isRunning: true,
                    startTime: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error('Error resuming background timer:', error);
        }
    };

    const getBackgroundTimerState = async (): Promise<BackgroundTimerState | null> => {
        try {
            const timerState = await AsyncStorage.getItem(BACKGROUND_TIMER_KEY);
            return timerState ? JSON.parse(timerState) : null;
        } catch (error) {
            console.error('Error getting background timer state:', error);
            return null;
        }
    };

    return {
        isBackgroundActive,
        startBackgroundTimer,
        stopBackgroundTimer,
        pauseBackgroundTimer,
        resumeBackgroundTimer,
        getBackgroundTimerState,
        handleAppForeground
    };
}; 