/**
 * Activity Template Service
 * Provides predefined activity templates organized by emoji-based categories
 * System-defined templates only (no user creation initially)
 */

import { ActivityTemplate } from '../../../shared/types/loop';

/**
 * Predefined activity templates by category
 * 6 categories with emoji-based organization
 */
const PREDEFINED_TEMPLATES: ActivityTemplate[] = [
    // Focus 📚 Category
    {
        id: 'focus_deep_work',
        title: 'Deep Work',
        emoji: '📚',
        description: 'Focused work session without distractions',
        linkedTarget: undefined,
        category: 'Focus 📚',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'focus_reading',
        title: 'Reading',
        emoji: '📖',
        description: 'Reading books, articles, or documents',
        linkedTarget: 'notes',
        category: 'Focus 📚',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'focus_studying',
        title: 'Studying',
        emoji: '📝',
        description: 'Learning new concepts or reviewing material',
        linkedTarget: 'notes',
        category: 'Focus 📚',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'focus_planning',
        title: 'Planning',
        emoji: '🎯',
        description: 'Strategic planning and goal setting',
        linkedTarget: 'paths',
        category: 'Focus 📚',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'focus_review_goals',
        title: 'Review Goals',
        emoji: '📊',
        description: 'Review progress and adjust goals',
        linkedTarget: 'paths',
        category: 'Focus 📚',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'focus_email_processing',
        title: 'Email Processing',
        emoji: '📧',
        description: 'Process and respond to emails efficiently',
        linkedTarget: 'actions',
        category: 'Focus 📚',
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Movement 🏃 Category
    {
        id: 'movement_running',
        title: 'Running',
        emoji: '🏃',
        description: 'Cardiovascular running exercise',
        linkedTarget: undefined,
        category: 'Movement 🏃',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'movement_walking',
        title: 'Walking',
        emoji: '🚶',
        description: 'Light walking for movement and fresh air',
        linkedTarget: undefined,
        category: 'Movement 🏃',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'movement_workout',
        title: 'Workout',
        emoji: '💪',
        description: 'Strength training or general workout',
        linkedTarget: undefined,
        category: 'Movement 🏃',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'movement_yoga',
        title: 'Yoga',
        emoji: '🧘‍♀️',
        description: 'Yoga practice for flexibility and mindfulness',
        linkedTarget: undefined,
        category: 'Movement 🏃',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'movement_swimming',
        title: 'Swimming',
        emoji: '🏊',
        description: 'Swimming for full-body exercise',
        linkedTarget: undefined,
        category: 'Movement 🏃',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'movement_stretching',
        title: 'Stretching',
        emoji: '🤸',
        description: 'Stretching exercises for flexibility',
        linkedTarget: undefined,
        category: 'Movement 🏃',
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Wellness 🧘 Category
    {
        id: 'wellness_meditation',
        title: 'Meditation',
        emoji: '🧘',
        description: 'Mindfulness meditation practice',
        linkedTarget: undefined,
        category: 'Wellness 🧘',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'wellness_breathing',
        title: 'Breathing',
        emoji: '🌬️',
        description: 'Breathing exercises for relaxation',
        linkedTarget: undefined,
        category: 'Wellness 🧘',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'wellness_gratitude',
        title: 'Gratitude',
        emoji: '🙏',
        description: 'Gratitude practice and reflection',
        linkedTarget: 'notes',
        category: 'Wellness 🧘',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'wellness_rest',
        title: 'Rest',
        emoji: '😴',
        description: 'Rest period for recovery',
        linkedTarget: undefined,
        category: 'Wellness 🧘',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'wellness_hydration',
        title: 'Hydration',
        emoji: '💧',
        description: 'Drink water and stay hydrated',
        linkedTarget: undefined,
        category: 'Wellness 🧘',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'wellness_healthy_meal',
        title: 'Healthy Meal',
        emoji: '🥗',
        description: 'Prepare and enjoy a healthy meal',
        linkedTarget: undefined,
        category: 'Wellness 🧘',
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Creative 🎨 Category
    {
        id: 'creative_drawing',
        title: 'Drawing',
        emoji: '🎨',
        description: 'Creative drawing and sketching',
        linkedTarget: 'sparks',
        category: 'Creative 🎨',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'creative_music',
        title: 'Music',
        emoji: '🎵',
        description: 'Playing or listening to music',
        linkedTarget: 'sparks',
        category: 'Creative 🎨',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'creative_journaling',
        title: 'Journaling',
        emoji: '📝',
        description: 'Personal journaling and reflection',
        linkedTarget: 'notes',
        category: 'Creative 🎨',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'creative_photography',
        title: 'Photography',
        emoji: '📸',
        description: 'Taking photos and visual creativity',
        linkedTarget: 'sparks',
        category: 'Creative 🎨',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'creative_brainstorming',
        title: 'Brainstorming',
        emoji: '💡',
        description: 'Creative ideation and brainstorming',
        linkedTarget: 'sparks',
        category: 'Creative 🎨',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'creative_writing',
        title: 'Writing',
        emoji: '✍️',
        description: 'Creative writing and storytelling',
        linkedTarget: 'notes',
        category: 'Creative 🎨',
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Social 👥 Category
    {
        id: 'social_call_friend',
        title: 'Call Friend',
        emoji: '📞',
        description: 'Call a friend or family member',
        linkedTarget: undefined,
        category: 'Social 👥',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'social_team_meeting',
        title: 'Team Meeting',
        emoji: '👥',
        description: 'Attend or lead a team meeting',
        linkedTarget: 'actions',
        category: 'Social 👥',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'social_family_time',
        title: 'Family Time',
        emoji: '🍽️',
        description: 'Spend quality time with family',
        linkedTarget: undefined,
        category: 'Social 👥',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'social_connections',
        title: 'Connections',
        emoji: '💬',
        description: 'Connect with people and build relationships',
        linkedTarget: undefined,
        category: 'Social 👥',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'social_networking',
        title: 'Networking',
        emoji: '🤝',
        description: 'Professional networking activities',
        linkedTarget: 'actions',
        category: 'Social 👥',
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Maintenance 🏠 Category
    {
        id: 'maintenance_cleaning',
        title: 'Cleaning',
        emoji: '🧹',
        description: 'Clean and organize living space',
        linkedTarget: undefined,
        category: 'Maintenance 🏠',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'maintenance_organizing',
        title: 'Organizing',
        emoji: '📋',
        description: 'Organize files, documents, or spaces',
        linkedTarget: undefined,
        category: 'Maintenance 🏠',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'maintenance_admin_tasks',
        title: 'Admin Tasks',
        emoji: '📄',
        description: 'Administrative tasks and paperwork',
        linkedTarget: 'actions',
        category: 'Maintenance 🏠',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'maintenance_filing',
        title: 'Filing',
        emoji: '🗂️',
        description: 'File documents and organize records',
        linkedTarget: undefined,
        category: 'Maintenance 🏠',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'maintenance_repairs',
        title: 'Repairs',
        emoji: '🛠️',
        description: 'Fix and maintain household items',
        linkedTarget: 'actions',
        category: 'Maintenance 🏠',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'maintenance_medicine',
        title: 'Medicine',
        emoji: '💊',
        description: 'Take medication or health supplements',
        linkedTarget: undefined,
        category: 'Maintenance 🏠',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

/**
 * Activity Template Service
 * Manages predefined activity templates with category-based organization
 */
export class ActivityTemplateService {
    /**
     * Get all available templates
     */
    static getAllTemplates(): ActivityTemplate[] {
        return [...PREDEFINED_TEMPLATES];
    }

    /**
     * Get templates by category
     */
    static getTemplatesByCategory(category: string): ActivityTemplate[] {
        return PREDEFINED_TEMPLATES.filter(template => template.category === category);
    }

    /**
     * Get all template categories
     */
    static getTemplateCategories(): string[] {
        return [
            'Focus 📚',
            'Movement 🏃',
            'Wellness 🧘',
            'Creative 🎨',
            'Social 👥',
            'Maintenance 🏠'
        ];
    }

    /**
     * Search templates by title or description
     */
    static searchTemplates(query: string): ActivityTemplate[] {
        const lowercaseQuery = query.toLowerCase();
        return PREDEFINED_TEMPLATES.filter(template =>
            template.title.toLowerCase().includes(lowercaseQuery) ||
            template.description?.toLowerCase().includes(lowercaseQuery)
        );
    }

    /**
     * Get template by ID
     */
    static getTemplateById(id: string): ActivityTemplate | undefined {
        return PREDEFINED_TEMPLATES.find(template => template.id === id);
    }

    /**
     * Get templates with linked targets
     */
    static getTemplatesWithLinkedTargets(): ActivityTemplate[] {
        return PREDEFINED_TEMPLATES.filter(template => template.linkedTarget);
    }

    /**
     * Get templates by linked target type
     */
    static getTemplatesByLinkedTarget(target: 'notes' | 'sparks' | 'actions' | 'paths'): ActivityTemplate[] {
        return PREDEFINED_TEMPLATES.filter(template => template.linkedTarget === target);
    }
} 