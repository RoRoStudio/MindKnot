// src/contexts/VaultFiltersContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

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

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedTags([]);
        setCategoryId(null);
        setSort('newest');
    };

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
            }}
        >
            {children}
        </VaultFiltersContext.Provider>
    );
};