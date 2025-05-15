// src/contexts/BottomSheetContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import NoteFormSheet from '../components/notes/NoteFormSheet';
import SparkFormSheet from '../components/sparks/SparkFormSheet';
import ActionFormSheet from '../components/actions/ActionFormSheet';
import LoopFormSheet from '../components/loops/LoopFormSheet';
import PathFormSheet from '../components/paths/PathFormSheet';
import { useNotes } from '../hooks/useNotes';
import { useSparks } from '../hooks/useSparks';
import { useActions } from '../hooks/useActions';
import { usePaths } from '../hooks/usePaths';
import { useLoops } from '../hooks/useLoops';

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
    // Track visibility of each sheet type
    const [noteFormVisible, setNoteFormVisible] = useState(false);
    const [noteOnSuccess, setNoteOnSuccess] = useState<(() => void) | undefined>(undefined);

    const [sparkFormVisible, setSparkFormVisible] = useState(false);
    const [sparkOnSuccess, setSparkOnSuccess] = useState<(() => void) | undefined>(undefined);

    const [actionFormVisible, setActionFormVisible] = useState(false);
    const [actionParentId, setActionParentId] = useState<string | undefined>(undefined);
    const [actionParentType, setActionParentType] = useState<'path' | 'milestone' | 'loop-item' | undefined>(undefined);
    const [actionOnSuccess, setActionOnSuccess] = useState<(() => void) | undefined>(undefined);

    const [loopFormVisible, setLoopFormVisible] = useState(false);
    const [loopOnSuccess, setLoopOnSuccess] = useState<(() => void) | undefined>(undefined);

    const [pathFormVisible, setPathFormVisible] = useState(false);
    const [pathOnSuccess, setPathOnSuccess] = useState<(() => void) | undefined>(undefined);

    // Get data loading functions from hooks
    const { loadNotes } = useNotes();
    const { loadSparks } = useSparks();
    const { loadActions } = useActions();
    const { loadPaths } = usePaths();
    const { loadLoops } = useLoops();

    // Custom success handlers that refresh data
    const handleNoteSuccess = useCallback(() => {
        loadNotes();
        if (noteOnSuccess) noteOnSuccess();
    }, [loadNotes, noteOnSuccess]);

    const handleSparkSuccess = useCallback(() => {
        loadSparks();
        if (sparkOnSuccess) sparkOnSuccess();
    }, [loadSparks, sparkOnSuccess]);

    const handleActionSuccess = useCallback(() => {
        loadActions();
        if (actionOnSuccess) actionOnSuccess();
    }, [loadActions, actionOnSuccess]);

    const handleLoopSuccess = useCallback(() => {
        loadLoops();
        if (loopOnSuccess) loopOnSuccess();
    }, [loadLoops, loopOnSuccess]);

    const handlePathSuccess = useCallback(() => {
        loadPaths();
        if (pathOnSuccess) pathOnSuccess();
    }, [loadPaths, pathOnSuccess]);

    // Functions to show/hide different form types
    const showNoteForm = (onSuccess?: () => void) => {
        setNoteOnSuccess(() => onSuccess);
        setNoteFormVisible(true);
    };

    const showSparkForm = (onSuccess?: () => void) => {
        setSparkOnSuccess(() => onSuccess);
        setSparkFormVisible(true);
    };

    const showActionForm = (
        parentId?: string,
        parentType?: 'path' | 'milestone' | 'loop-item',
        onSuccess?: () => void
    ) => {
        setActionParentId(parentId);
        setActionParentType(parentType);
        setActionOnSuccess(() => onSuccess);
        setActionFormVisible(true);
    };

    const showLoopForm = (onSuccess?: () => void) => {
        setLoopOnSuccess(() => onSuccess);
        setLoopFormVisible(true);
    };

    const showPathForm = (onSuccess?: () => void) => {
        setPathOnSuccess(() => onSuccess);
        setPathFormVisible(true);
    };

    const hideAllSheets = () => {
        setNoteFormVisible(false);
        setSparkFormVisible(false);
        setActionFormVisible(false);
        setLoopFormVisible(false);
        setPathFormVisible(false);
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
            }}
        >
            {children}

            {/* Render bottom sheets outside of the normal component hierarchy */}
            <NoteFormSheet
                visible={noteFormVisible}
                onClose={() => setNoteFormVisible(false)}
                onSuccess={handleNoteSuccess}
            />

            <SparkFormSheet
                visible={sparkFormVisible}
                onClose={() => setSparkFormVisible(false)}
                onSuccess={handleSparkSuccess}
            />

            <ActionFormSheet
                visible={actionFormVisible}
                onClose={() => setActionFormVisible(false)}
                parentId={actionParentId}
                parentType={actionParentType}
                onSuccess={handleActionSuccess}
            />

            <LoopFormSheet
                visible={loopFormVisible}
                onClose={() => setLoopFormVisible(false)}
                onSuccess={handleLoopSuccess}
            />

            <PathFormSheet
                visible={pathFormVisible}
                onClose={() => setPathFormVisible(false)}
                onSuccess={handlePathSuccess}
            />
        </BottomSheetContext.Provider>
    );
};