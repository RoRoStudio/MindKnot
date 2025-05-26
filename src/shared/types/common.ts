// Common types used across the application

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface TimestampedEntity {
    createdAt: string;
    updatedAt: string;
}

export interface TaggedEntity {
    tags?: string[];
}

export interface CategorizedEntity {
    categoryId?: string;
}

export interface StarredEntity {
    starred?: boolean;
}

export interface HiddenEntity {
    hidden?: boolean;
} 