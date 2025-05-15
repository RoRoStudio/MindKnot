// src/contexts/BottomSheetContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import NoteFormSheet from '../components/entries/notes/NoteFormSheet';
import SparkFormSheet from '../components/entries/sparks/SparkFormSheet';
import ActionFormSheet from '../components/entries/actions/ActionFormSheet';
import LoopFormSheet from '../components/entries/loops/LoopFormSheet';
import PathFormSheet from '../components/entries/paths/PathFormSheet';
import CategoryFormSheet from '../components/categories/CategoryFormSheet';
import { useNotes } from '../hooks/useNotes';
import { useSparks } from '../hooks/useSparks';
import { useActions } from '../hooks/useActions';
import { usePaths } from '../hooks/usePaths';
import { useLoops } from '../hooks/useLoops';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types/category';

interface BottomSheetContextType {
    showNoteForm: (onSuccess?: () => void) => void;
    showSparkForm: (onSuccess?: () => void) => void;
    showActionForm: (parentId?: string, parentType?: 'path' | 'milestone' | 'loop-item', onSuccess?: () => void) => void;
    showLoopForm: (onSuccess?: () => void) => void;
    showPathForm: (onSuccess?: () => void) => void;
    showCategoryForm: (category?: Category, onSuccess?: () => void) => void;
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

    const [categoryFormVisible, setCategoryFormVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
    const [categoryOnSuccess, setCategoryOnSuccess] = useState<(() => void) | undefined>(undefined);

    // Get data loading functions from hooks
    const { loadNotes } = useNotes();
    const { loadSparks } = useSparks();
    const { loadActions } = useActions();
    const { loadPaths } = usePaths();
    const { loadLoops } = useLoops();
    const { addCategory, editCategory, loadCategories } = useCategories();

    // Enhanced success handlers with better logging
    const handleNoteSuccess = useCallback(() => {
        console.log('Note success callback triggered');
        loadNotes().then(() => {
            console.log('Notes reloaded successfully');
            if (noteOnSuccess) {
                console.log('Calling additional onSuccess callback');
                noteOnSuccess();
            }
        }).catch(err => {
            console.error('Error reloading notes:', err);
        });
    }, [loadNotes, noteOnSuccess]);

    const handleSparkSuccess = useCallback(() => {
        console.log('Spark success callback triggered');
        loadSparks().then(() => {
            console.log('Sparks reloaded successfully');
            if (sparkOnSuccess) {
                console.log('Calling additional onSuccess callback');
                sparkOnSuccess();
            }
        }).catch(err => {
            console.error('Error reloading sparks:', err);
        });
    }, [loadSparks, sparkOnSuccess]);

    const handleActionSuccess = useCallback(() => {
        console.log('Action success callback triggered');
        loadActions().then(() => {
            console.log('Actions reloaded successfully');
            if (actionOnSuccess) {
                console.log('Calling additional onSuccess callback');
                actionOnSuccess();
            }
        }).catch(err => {
            console.error('Error reloading actions:', err);
        });
    }, [loadActions, actionOnSuccess]);

    const handleLoopSuccess = useCallback(() => {
        console.log('Loop success callback triggered');
        loadLoops().then(() => {
            console.log('Loops reloaded successfully');
            if (loopOnSuccess) {
                console.log('Calling additional onSuccess callback');
                loopOnSuccess();
            }
        }).catch(err => {
            console.error('Error reloading loops:', err);
        });
    }, [loadLoops, loopOnSuccess]);

    const handlePathSuccess = useCallback(() => {
        console.log('Path success callback triggered');
        loadPaths().then(() => {
            console.log('Paths reloaded successfully');
            if (pathOnSuccess) {
                console.log('Calling additional onSuccess callback');
                pathOnSuccess();
            }
        }).catch(err => {
            console.error('Error reloading paths:', err);
        });
    }, [loadPaths, pathOnSuccess]);

    const handleCategorySuccess = useCallback(() => {
        console.log('Category success callback triggered');
        loadCategories().then(() => {
            console.log('Categories reloaded successfully');
            if (categoryOnSuccess) {
                console.log('Calling additional onSuccess callback');
                categoryOnSuccess();
            }
        }).catch(err => {
            console.error('Error reloading categories:', err);
        });
    }, [loadCategories, categoryOnSuccess]);

    const handleSaveCategory = useCallback(async (title: string, color: string) => {
        if (selectedCategory) {
            // Edit existing category
            return await editCategory(selectedCategory.id, { title, color });
        } else {
            // Create new category
            return await addCategory(title, color);
        }
    }, [selectedCategory, addCategory, editCategory]);

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

    const showCategoryForm = (category?: Category, onSuccess?: () => void) => {
        setSelectedCategory(category);
        setCategoryOnSuccess(() => onSuccess);
        setCategoryFormVisible(true);
    };

    const hideAllSheets = () => {
        setNoteFormVisible(false);
        setSparkFormVisible(false);
        setActionFormVisible(false);
        setLoopFormVisible(false);
        setPathFormVisible(false);
        setCategoryFormVisible(false);
    };

    return (
        <BottomSheetContext.Provider
            value={{
                showNoteForm,
                showSparkForm,
                showActionForm,
                showLoopForm,
                showPathForm,
                showCategoryForm,
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

            <CategoryFormSheet
                visible={categoryFormVisible}
                onClose={() => setCategoryFormVisible(false)}
                onSave={handleSaveCategory}
                category={selectedCategory}
            />
        </BottomSheetContext.Provider>
    );
};