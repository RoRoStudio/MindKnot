/**
 * useActivityTemplates Hook
 * Template management with 36 predefined templates across 6 categories
 * 
 * Features:
 * - 6 emoji-based categories with predefined templates
 * - Template filtering by category
 * - Search functionality
 * - System-defined templates (no user creation initially)
 */

import { useState, useEffect, useMemo } from 'react';
import { ActivityTemplate } from '../../../shared/types/loop';

export interface UseActivityTemplatesReturn {
    /** All available templates */
    templates: ActivityTemplate[];

    /** Available categories */
    categories: string[];

    /** Get templates by category */
    getTemplatesByCategory: (category: string) => ActivityTemplate[];

    /** Search templates */
    searchTemplates: (query: string) => ActivityTemplate[];

    /** Get template by ID */
    getTemplateById: (id: string) => ActivityTemplate | undefined;

    /** Loading state */
    isLoading: boolean;
}

/**
 * Hook for managing activity templates
 */
export const useActivityTemplates = (): UseActivityTemplatesReturn => {
    const [isLoading, setIsLoading] = useState(false);

    // Predefined templates across 6 categories
    const templates: ActivityTemplate[] = useMemo(() => [
        // Focus 📚 Category
        {
            id: 'focus_deep_work',
            title: 'Deep Work',
            emoji: '📚',
            description: 'Focused work session without distractions',
            linkedTarget: 'notes',
            category: 'focus',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'focus_reading',
            title: 'Reading',
            emoji: '📖',
            description: 'Read books, articles, or documents',
            linkedTarget: 'notes',
            category: 'focus',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'focus_studying',
            title: 'Studying',
            emoji: '📝',
            description: 'Study and learn new material',
            linkedTarget: 'notes',
            category: 'focus',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'focus_planning',
            title: 'Planning',
            emoji: '🎯',
            description: 'Plan your day, week, or projects',
            linkedTarget: 'actions',
            category: 'focus',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'focus_review_goals',
            title: 'Review Goals',
            emoji: '📊',
            description: 'Review and update your goals',
            linkedTarget: 'paths',
            category: 'focus',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'focus_email_processing',
            title: 'Email Processing',
            emoji: '📧',
            description: 'Process and organize emails',
            category: 'focus',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Movement 🏃 Category
        {
            id: 'movement_running',
            title: 'Running',
            emoji: '🏃',
            description: 'Go for a run outdoors or on treadmill',
            category: 'movement',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'movement_walking',
            title: 'Walking',
            emoji: '🚶',
            description: 'Take a walk for exercise and fresh air',
            category: 'movement',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'movement_workout',
            title: 'Workout',
            emoji: '💪',
            description: 'Strength training or gym workout',
            category: 'movement',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'movement_yoga',
            title: 'Yoga',
            emoji: '🧘‍♀️',
            description: 'Practice yoga poses and breathing',
            category: 'movement',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'movement_swimming',
            title: 'Swimming',
            emoji: '🏊',
            description: 'Swimming for cardio and full-body exercise',
            category: 'movement',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'movement_stretching',
            title: 'Stretching',
            emoji: '🤸',
            description: 'Stretch muscles and improve flexibility',
            category: 'movement',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Wellness 🧘 Category
        {
            id: 'wellness_meditation',
            title: 'Meditation',
            emoji: '🧘',
            description: 'Mindfulness meditation and mental clarity',
            linkedTarget: 'sparks',
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'wellness_breathing',
            title: 'Breathing',
            emoji: '🌬️',
            description: 'Breathing exercises for relaxation',
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'wellness_gratitude',
            title: 'Gratitude',
            emoji: '🙏',
            description: 'Practice gratitude and appreciation',
            linkedTarget: 'sparks',
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'wellness_rest',
            title: 'Rest',
            emoji: '😴',
            description: 'Take a break and rest',
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'wellness_hydration',
            title: 'Hydration',
            emoji: '💧',
            description: 'Drink water and stay hydrated',
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'wellness_healthy_meal',
            title: 'Healthy Meal',
            emoji: '🥗',
            description: 'Prepare and eat a nutritious meal',
            category: 'wellness',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Creative 🎨 Category
        {
            id: 'creative_drawing',
            title: 'Drawing',
            emoji: '🎨',
            description: 'Draw, sketch, or create visual art',
            linkedTarget: 'sparks',
            category: 'creative',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'creative_music',
            title: 'Music',
            emoji: '🎵',
            description: 'Play, listen to, or create music',
            linkedTarget: 'sparks',
            category: 'creative',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'creative_journaling',
            title: 'Journaling',
            emoji: '📝',
            description: 'Write in your journal or diary',
            linkedTarget: 'notes',
            category: 'creative',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'creative_photography',
            title: 'Photography',
            emoji: '📸',
            description: 'Take photos and capture moments',
            linkedTarget: 'sparks',
            category: 'creative',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'creative_brainstorming',
            title: 'Brainstorming',
            emoji: '💡',
            description: 'Generate ideas and creative solutions',
            linkedTarget: 'sparks',
            category: 'creative',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'creative_writing',
            title: 'Writing',
            emoji: '✍️',
            description: 'Creative writing and storytelling',
            linkedTarget: 'notes',
            category: 'creative',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Social 👥 Category
        {
            id: 'social_call_friend',
            title: 'Call Friend',
            emoji: '📞',
            description: 'Call a friend or family member',
            category: 'social',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'social_team_meeting',
            title: 'Team Meeting',
            emoji: '👥',
            description: 'Attend or host a team meeting',
            linkedTarget: 'actions',
            category: 'social',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'social_family_time',
            title: 'Family Time',
            emoji: '🍽️',
            description: 'Spend quality time with family',
            category: 'social',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'social_connections',
            title: 'Connections',
            emoji: '💬',
            description: 'Connect with people and build relationships',
            category: 'social',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'social_networking',
            title: 'Networking',
            emoji: '🤝',
            description: 'Professional networking and relationship building',
            linkedTarget: 'actions',
            category: 'social',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'social_community',
            title: 'Community',
            emoji: '🏘️',
            description: 'Participate in community activities',
            category: 'social',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Maintenance 🏠 Category
        {
            id: 'maintenance_cleaning',
            title: 'Cleaning',
            emoji: '🧹',
            description: 'Clean and tidy up your space',
            category: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'maintenance_organizing',
            title: 'Organizing',
            emoji: '📋',
            description: 'Organize and declutter your space',
            category: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'maintenance_admin_tasks',
            title: 'Admin Tasks',
            emoji: '📄',
            description: 'Handle administrative tasks and paperwork',
            linkedTarget: 'actions',
            category: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'maintenance_filing',
            title: 'Filing',
            emoji: '🗂️',
            description: 'File documents and organize paperwork',
            category: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'maintenance_repairs',
            title: 'Repairs',
            emoji: '🛠️',
            description: 'Fix and maintain household items',
            category: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'maintenance_medicine',
            title: 'Medicine',
            emoji: '💊',
            description: 'Take medication and health maintenance',
            category: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ], []);

    // Available categories
    const categories = useMemo(() => [
        'focus',
        'movement',
        'wellness',
        'creative',
        'social',
        'maintenance',
    ], []);

    // Get templates by category
    const getTemplatesByCategory = (category: string): ActivityTemplate[] => {
        return templates.filter(template => template.category === category);
    };

    // Search templates
    const searchTemplates = (query: string): ActivityTemplate[] => {
        if (!query.trim()) return templates;

        const searchTerm = query.toLowerCase();
        return templates.filter(template =>
            template.title.toLowerCase().includes(searchTerm) ||
            template.description?.toLowerCase().includes(searchTerm) ||
            template.category.toLowerCase().includes(searchTerm)
        );
    };

    // Get template by ID
    const getTemplateById = (id: string): ActivityTemplate | undefined => {
        return templates.find(template => template.id === id);
    };

    return {
        templates,
        categories,
        getTemplatesByCategory,
        searchTemplates,
        getTemplateById,
        isLoading,
    };
}; 