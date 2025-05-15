// src/components/entries/EntryCard.tsx
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';
import { Icon, IconName } from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';

interface EntryCardProps {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    iconName: IconName;
    iconColor?: string;
    createdAt: string;
    tags?: string[];
    categoryId?: string;
    onPress?: () => void;
    done?: boolean;
    dueDate?: string;
}

export const EntryCard: React.FC<EntryCardProps> = ({
    id,
    title,
    subtitle,
    description,
    iconName,
    iconColor,
    createdAt,
    tags,
    categoryId,
    onPress,
    done,
    dueDate,
}) => {
    const { theme } = useTheme();
    const { getCategory } = useCategories();
    const [category, setCategory] = useState<Category | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            if (categoryId) {
                const cat = await getCategory(categoryId);
                setCategory(cat);
            } else {
                setCategory(null);
            }
        };

        fetchCategory();
    }, [categoryId]);

    const styles = useStyles((theme) => ({
        card: {
            marginBottom: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: category ? category.color : (iconColor || theme.colors.primary),
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        iconContainer: {
            marginRight: theme.spacing.s,
        },
        title: {
            flex: 1,
        },
        subtitle: {
            marginTop: 2,
            color: theme.colors.textSecondary,
        },
        description: {
            marginVertical: theme.spacing.xs,
            color: theme.colors.textPrimary,
        },
        metaContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.s,
        },
        dateText: {
            color: theme.colors.textSecondary,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.xs,
        },
        tag: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 2,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        tagText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        categoryTag: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 2,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
        },
        categoryDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 4,
        },
        categoryTextContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dueDate: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dueDateText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
        },
        doneIndicator: {
            backgroundColor: theme.colors.success,
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: theme.spacing.xs,
        },
    }));

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Format due date with color indication
    const renderDueDate = () => {
        if (!dueDate) return null;

        const date = new Date(dueDate);
        const now = new Date();
        const isOverdue = date < now && !done;

        return (
            <View style={styles.dueDate}>
                <Icon
                    name="calendar"
                    width={12}
                    height={12}
                    color={isOverdue ? theme.colors.error : styles.dueDateText.color}
                />
                <Typography
                    style={[
                        styles.dueDateText,
                        isOverdue && { color: theme.colors.error },
                    ]}
                >
                    {formatDate(dueDate)}
                </Typography>
            </View>
        );
    };

    const renderCategory = () => {
        if (!category) return null;

        return (
            <View 
                style={[
                    styles.categoryTag, 
                    { 
                        backgroundColor: `${category.color}20`,  // 20% opacity
                        borderColor: category.color,
                        borderWidth: 1,
                    }
                ]}
            >
                <View style={styles.categoryTextContainer}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Typography style={styles.tagText}>
                        {category.title}
                    </Typography>
                </View>
            </View>
        );
    };

    return (
        <Card style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Icon
                        name={iconName}
                        width={18}
                        height={18}
                        color={category ? category.color : (iconColor || theme.colors.primary)}
                    />
                    {done !== undefined && done && (
                        <View style={styles.doneIndicator} />
                    )}
                </View>
                <Typography variant="h4" style={styles.title}>
                    {title || 'Untitled'}
                </Typography>
            </View>

            {subtitle && (
                <Typography variant="caption" style={styles.subtitle}>
                    {subtitle}
                </Typography>
            )}

            {description && (
                <Typography variant="body2" style={styles.description} numberOfLines={2}>
                    {description}
                </Typography>
            )}

            <View style={styles.metaContainer}>
                <Typography variant="caption" style={styles.dateText}>
                    {formatDate(createdAt)}
                </Typography>
                {renderDueDate()}
            </View>

            <View style={styles.tagsContainer}>
                {renderCategory()}
                
                {tags && tags.length > 0 && tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Typography style={styles.tagText}>
                            {tag}
                        </Typography>
                    </View>
                ))}
            </View>
        </Card>
    );
};