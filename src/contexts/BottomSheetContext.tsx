// src/contexts/BottomSheetContext.tsx
import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNotes } from '../hooks/useNotes';
import { useSparks } from '../hooks/useSparks';
import { useActions } from '../hooks/useActions';
import { usePaths } from '../hooks/usePaths';
import { useLoops } from '../hooks/useLoops';
import { RootStackParamList } from '../types/navigation-types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BottomSheetContextType {
    showNoteForm: (onSuccess?: () => void) => void;
    showSparkForm: (onSuccess?: () => void) => void;
    showActionForm: (parentId?: string, parentType?: 'path' | 'milestone' | 'loop-item', onSuccess?: () => void) => void;
    showLoopForm: (onSuccess?: () => void) => void;
    showPathForm: (onSuccess?: () => void) => void;
    hideAllSheets: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const useBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (context === undefined) {
        throw new Error('useBottomSheet must be used within a BottomSheetProvider');
    }
    return context;
};

interface BottomSheetProviderProps {
    children: ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({ children }) => {
    const navigation = useNavigation<NavigationProp>();

    // Get data loading functions from hooks
    const { loadNotes } = useNotes();
    const { loadSparks } = useSparks();
    const { loadActions } = useActions();
    const { loadPaths } = usePaths();
    const { loadLoops } = useLoops();

    // Functions to navigate to different form screens
    const showNoteForm = useCallback((onSuccess?: () => void) => {
        navigation.navigate('NoteScreen', { mode: 'create' });
    }, [navigation]);

    const showSparkForm = useCallback((onSuccess?: () => void) => {
        navigation.navigate('SparkScreen', { mode: 'create' });
    }, [navigation]);

    const showActionForm = useCallback(
        (parentId?: string, parentType?: 'path' | 'milestone' | 'loop-item', onSuccess?: () => void) => {
            navigation.navigate('ActionScreen', {
                mode: 'create',
                parentId,
                parentType
            });
        },
        [navigation]
    );

    const showLoopForm = useCallback((onSuccess?: () => void) => {
        navigation.navigate('LoopScreen', { mode: 'create' });
    }, [navigation]);

    const showPathForm = useCallback((onSuccess?: () => void) => {
        navigation.navigate('PathScreen', { mode: 'create' });
    }, [navigation]);

    // This function doesn't do anything anymore, but we keep it for compatibility
    const hideAllSheets = useCallback(() => {
        // This function is kept for API compatibility
        // but doesn't need to do anything as we're using screens now
    }, []);

    return (
        <BottomSheetContext.Provider
            value={{
                showNoteForm,
                showSparkForm,
                showActionForm,
                showLoopForm,
                showPathForm,
                hideAllSheets,
            }}
        >
            {children}
            {/* No bottom sheets are rendered here anymore */}
        </BottomSheetContext.Provider>
    );
};