import { useState, useEffect } from 'react';
import { useLoopActions } from '../store/loops';

export const useExpandableLoopHeader = () => {
    const [showExecutionScreen, setShowExecutionScreen] = useState(false);
    const { activeExecution, loadActiveExecution } = useLoopActions();

    // Load active execution on mount
    useEffect(() => {
        loadActiveExecution();
    }, [loadActiveExecution]);

    const handleOpenExecution = () => {
        setShowExecutionScreen(true);
    };

    const handleCloseExecution = () => {
        setShowExecutionScreen(false);
    };

    return {
        // State
        showExecutionScreen,
        hasActiveLoop: !!activeExecution,

        // Actions
        openExecution: handleOpenExecution,
        closeExecution: handleCloseExecution,

        // Data
        activeExecution,
    };
}; 