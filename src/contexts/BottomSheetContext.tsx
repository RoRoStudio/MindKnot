// src/contexts/BottomSheetContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { RootStackParamList } from '../types/navigation-types';

interface BottomSheetContextType {
    showNoteForm: (onSuccess?: () => void) => void;
    showSparkForm: (onSuccess?: () => void) => void;
    showActionForm: (parentId?: string, parentType?: 'path' | 'milestone' | 'loop-item', onSuccess?: () => void) => void;
    showLoopForm: (onSuccess?: () => void) => void;
    showPathForm: (onSuccess?: () => void) => void;
    hideAllSheets: () => void;
    
    // Add navigation callback handler
    setNavigationCallback: (callback: (screen: keyof RootStackParamList, params: any) => void) => void;
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
    // Instead of direct navigation, we'll use a callback that can be set by navigation-aware components
    let navigateCallback: ((screen: keyof RootStackParamList, params: any) => void) | null = null;
    
    const setNavigationCallback = (callback: (screen: keyof RootStackParamList, params: any) => void) => {
        navigateCallback = callback;
    };

    // Functions to handle navigation to different form screens
    const showNoteForm = (onSuccess?: () => void) => {
        if (navigateCallback) {
            navigateCallback('NoteScreen', { mode: 'create' });
        }
    };

    const showSparkForm = (onSuccess?: () => void) => {
        if (navigateCallback) {
            navigateCallback('SparkScreen', { mode: 'create' });
        }
    };

    const showActionForm = (
        parentId?: string, 
        parentType?: 'path' | 'milestone' | 'loop-item', 
        onSuccess?: () => void
    ) => {
        if (navigateCallback) {
            navigateCallback('ActionScreen', {
                mode: 'create',
                parentId,
                parentType
            });
        }
    };

    const showLoopForm = (onSuccess?: () => void) => {
        if (navigateCallback) {
            navigateCallback('LoopScreen', { mode: 'create' });
        }
    };

    const showPathForm = (onSuccess?: () => void) => {
        if (navigateCallback) {
            navigateCallback('PathScreen', { mode: 'create' });
        }
    };

    // This function doesn't do anything anymore, but we keep it for compatibility
    const hideAllSheets = () => {
        // This function is kept for API compatibility
        // but doesn't need to do anything as we're using screens now
    };

    return (
        <BottomSheetContext.Provider
            value={{
                showNoteForm,
                showSparkForm,
                showActionForm,
                showLoopForm,
                showPathForm,
                hideAllSheets,
                setNavigationCallback,
            }}
        >
            {children}
        </BottomSheetContext.Provider>
    );
};