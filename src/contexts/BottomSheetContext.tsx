// src/contexts/BottomSheetContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import CaptureFormSheet from '../components/captures/CaptureFormSheet';
import LoopFormSheet from '../components/loops/LoopFormSheet';
import PathFormSheet from '../components/paths/PathFormSheet';
import { CaptureSubType } from '../types/capture';

interface BottomSheetContextType {
    showCaptureForm: (initialSubType?: CaptureSubType, initialSagaId?: string, onSuccess?: () => void) => void;
    showLoopForm: (initialSagaId?: string, onSuccess?: () => void) => void;
    showPathForm: (initialSagaId?: string, onSuccess?: () => void) => void;
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
    const [captureFormVisible, setCaptureFormVisible] = useState(false);
    const [captureType, setCaptureType] = useState<CaptureSubType>(CaptureSubType.NOTE);
    const [captureInitialSagaId, setCaptureInitialSagaId] = useState<string | undefined>(undefined);
    const [captureOnSuccess, setCaptureOnSuccess] = useState<(() => void) | undefined>(undefined);

    const [loopFormVisible, setLoopFormVisible] = useState(false);
    const [loopInitialSagaId, setLoopInitialSagaId] = useState<string | undefined>(undefined);
    const [loopOnSuccess, setLoopOnSuccess] = useState<(() => void) | undefined>(undefined);

    const [pathFormVisible, setPathFormVisible] = useState(false);
    const [pathInitialSagaId, setPathInitialSagaId] = useState<string | undefined>(undefined);
    const [pathOnSuccess, setPathOnSuccess] = useState<(() => void) | undefined>(undefined);

    // Functions to show/hide different form types
    const showCaptureForm = (
        initialSubType: CaptureSubType = CaptureSubType.NOTE,
        initialSagaId?: string,
        onSuccess?: () => void
    ) => {
        setCaptureType(initialSubType);
        setCaptureInitialSagaId(initialSagaId);
        setCaptureOnSuccess(() => onSuccess);
        setCaptureFormVisible(true);
    };

    const showLoopForm = (initialSagaId?: string, onSuccess?: () => void) => {
        setLoopInitialSagaId(initialSagaId);
        setLoopOnSuccess(() => onSuccess);
        setLoopFormVisible(true);
    };

    const showPathForm = (initialSagaId?: string, onSuccess?: () => void) => {
        setPathInitialSagaId(initialSagaId);
        setPathOnSuccess(() => onSuccess);
        setPathFormVisible(true);
    };

    const hideAllSheets = () => {
        setCaptureFormVisible(false);
        setLoopFormVisible(false);
        setPathFormVisible(false);
    };

    return (
        <BottomSheetContext.Provider
            value={{
                showCaptureForm,
                showLoopForm,
                showPathForm,
                hideAllSheets,
            }}
        >
            {children}

            {/* Render bottom sheets outside of the normal component hierarchy */}
            <CaptureFormSheet
                visible={captureFormVisible}
                onClose={() => setCaptureFormVisible(false)}
                initialSubType={captureType}
                initialSagaId={captureInitialSagaId}
                onSuccess={captureOnSuccess}
            />

            <LoopFormSheet
                visible={loopFormVisible}
                onClose={() => setLoopFormVisible(false)}
                initialSagaId={loopInitialSagaId}
                onSuccess={loopOnSuccess}
            />

            <PathFormSheet
                visible={pathFormVisible}
                onClose={() => setPathFormVisible(false)}
                initialSagaId={pathInitialSagaId}
                onSuccess={pathOnSuccess}
            />
        </BottomSheetContext.Provider>
    );
};