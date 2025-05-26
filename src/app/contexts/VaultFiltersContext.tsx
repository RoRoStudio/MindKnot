// src/contexts/VaultFiltersContext.tsx - Updated with additional functionality
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface VaultFiltersContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    toggleTag: (tag: string) => void;
    categoryId: string | null;
    setCategoryId: (id: string | null) => void;
    sort: 'newest' | 'oldest' | 'alphabetical';
    setSort: (sort: 'newest' | 'oldest' | 'alphabetical') => void;
    clearFilters: () => void;
    isFiltered: boolean;
}

const VaultFiltersContext = createContext<VaultFiltersContextType | undefined>(undefined);

export const useVaultFilters = () => {
    const context = useContext(VaultFiltersContext);
    if (!context) {
        throw new Error('useVaultFilters must be used within a VaultFiltersProvider');
    }
    return context;
};

interface VaultFiltersProviderProps {
    children: ReactNode;
}

export const VaultFiltersProvider: React.FC<VaultFiltersProviderProps> = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sort, setSort] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedTags([]);
        setCategoryId(null);
        setSort('newest');
    }, []);

    // Check if any filters are applied
    const isFiltered = searchTerm !== '' || selectedTags.length > 0 || categoryId !== null;

    return (
        <VaultFiltersContext.Provider
            value={{
                searchTerm,
                setSearchTerm,
                selectedTags,
                setSelectedTags,
                toggleTag,
                categoryId,
                setCategoryId,
                sort,
                setSort,
                clearFilters,
                isFiltered
            }}
        >
            {children}
        </VaultFiltersContext.Provider>
    );
};