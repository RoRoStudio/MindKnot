// src/components/entries/EntryCard.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Card, Icon, IconName, CategoryPill, Tag } from '../common';
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
    expanded?: boolean;
    onExpand?: () => void;
    onStar?: () => void;
    onDuplicate?: () => void;
    onArchive?: () => void;
    onHide?: () => void;
    isStarred?: boolean;
    children?: React.ReactNode;
    extraData?: {
        setActiveActionMenuId: (id: string | null) => void;
        activeActionMenuId: string | null;
    };
}

export const EntryCard = memo(function EntryCard({
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
    expanded = false,
    onExpand,
    onStar,
    onDuplicate,
    onArchive,
    onHide,
    isStarred = false,
    children,
    extraData,
}: EntryCardProps) {
    const { theme } = useTheme();
    const { getCategory } = useCategories();
    const [category, setCategory] = useState<Category | null>(null);
    const [showActions, setShowActions] = useState(false);
    const [expandAnim] = useState(new Animated.Value(expanded ? 1 : 0));
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    const styles = useStyles((theme) => ({
        card: {
            marginBottom: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: category ? category.color : (iconColor || theme.colors.primary),
        },
        cardContent: {
            position: 'relative',
            padding: theme.spacing.s,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        iconContainer: {
            marginRight: theme.spacing.s,
        },
        titleContainer: {
            flex: 1,
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
        actionsButton: {
            padding: theme.spacing.xs,
            zIndex: 1,
        },
        actionsMenu: {
            position: 'absolute',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.xs,
            zIndex: 99999,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            width: 150,
            top: menuPosition.top,
            right: 10,
        },
        actionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.s,
        },
        actionItemText: {
            marginLeft: theme.spacing.s,
            color: theme.colors.textPrimary,
        },
        childrenContainer: {
            marginTop: theme.spacing.m,
            overflow: 'hidden',
        },
        expandIcon: {
            marginLeft: theme.spacing.xs,
            transform: [{ rotate: expanded ? '180deg' : '0deg' }],
        },
        starredIcon: {
            marginRight: theme.spacing.s,
        },
    }));

    // Fetch category
    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) {
                setCategory(null);
                return;
            }

            try {
                const cat = await getCategory(categoryId);
                setCategory(cat);
            } catch (err) {
                console.error('Error fetching category:', err);
                setCategory(null);
            }
        };

        fetchCategory();
    }, [categoryId, getCategory]);

    // Handle animation
    useEffect(() => {
        Animated.timing(expandAnim, {
            toValue: expanded ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [expanded, expandAnim]);

    // Handle menu visibility
    useEffect(() => {
        if (extraData && extraData.activeActionMenuId !== id && showActions) {
            setShowActions(false);
        }
    }, [extraData, id, showActions]);

    // Format a date for display
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }, []);

    // Menu toggle
    const handleToggleMenu = useCallback(() => {
        const newShowActions = !showActions;
        if (extraData) {
            extraData.setActiveActionMenuId(newShowActions ? id : null);
        }
        setShowActions(newShowActions);
    }, [showActions, extraData, id]);

    // Handle card press
    const handleCardPress = useCallback(() => {
        if (onPress) onPress();
    }, [onPress]);

    // Handle ellipsis press
    const handleEllipsisPress = useCallback((e: any) => {
        e.stopPropagation();
        handleToggleMenu();
    }, [handleToggleMenu]);

    // Measure action button
    const measureActionButton = useCallback((ref: View) => {
        if (!ref) return;

        ref.measure((x, y, width, height, pageX, pageY) => {
            setMenuPosition({
                top: pageY + height + 2,
                right: 0
            });
        });
    }, []);

    // Derived values
    const childrenMaxHeight = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 500]
    });

    // Render category element
    const renderCategory = () => {
        if (!category) return null;

        return (
            <CategoryPill
                title={category.title}
                color={category.color}
                size="small"
            />
        );
    };

    // Render due date
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
                    color={isOverdue ? theme.colors.error : theme.colors.textSecondary}
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

    // Render actions menu
    const renderActionsMenu = () => {
        if (!showActions) return null;

        return (
            <View style={styles.actionsMenu}>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                        setShowActions(false);
                        if (extraData) extraData.setActiveActionMenuId(null);
                        if (onStar) onStar();
                    }}
                >
                    <Icon name={isStarred ? "star-off" : "star"} width={16} height={16} color={theme.colors.primary} />
                    <Typography style={styles.actionItemText}>{isStarred ? "Unstar" : "Star"}</Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                        setShowActions(false);
                        if (extraData) extraData.setActiveActionMenuId(null);
                        if (onDuplicate) onDuplicate();
                    }}
                >
                    <Icon name="copy" width={16} height={16} color={theme.colors.primary} />
                    <Typography style={styles.actionItemText}>Duplicate</Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                        setShowActions(false);
                        if (extraData) extraData.setActiveActionMenuId(null);
                        if (onArchive) onArchive();
                    }}
                >
                    <Icon name="archive" width={16} height={16} color={theme.colors.primary} />
                    <Typography style={styles.actionItemText}>Archive</Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                        setShowActions(false);
                        if (extraData) extraData.setActiveActionMenuId(null);
                        if (onHide) onHide();
                    }}
                >
                    <Icon name="eye-off" width={16} height={16} color={theme.colors.primary} />
                    <Typography style={styles.actionItemText}>Hide</Typography>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View>
            <Card
                style={styles.card}
                onPress={handleCardPress}
                elevated={true}
                noPadding={true}
            >
                <View style={styles.cardContent}>
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

                        <View style={styles.titleContainer}>
                            <Typography variant="h4" style={styles.title}>
                                {title || 'Untitled'}
                            </Typography>

                            {subtitle && (
                                <Typography variant="caption" style={styles.subtitle}>
                                    {subtitle}
                                </Typography>
                            )}
                        </View>

                        {isStarred && (
                            <Icon
                                name="star"
                                width={16}
                                height={16}
                                color="#FFB800"
                                style={styles.starredIcon}
                            />
                        )}

                        {children && onExpand && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    if (onExpand) onExpand();
                                }}
                                style={styles.expandIcon}
                            >
                                <Icon
                                    name="chevron-down"
                                    width={20}
                                    height={20}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        )}

                        <View
                            ref={measureActionButton}
                            style={{ position: 'relative' }}
                        >
                            <TouchableOpacity
                                style={styles.actionsButton}
                                onPress={handleEllipsisPress}
                            >
                                <Icon
                                    name="ellipsis-vertical"
                                    width={18}
                                    height={18}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

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
                            <Tag
                                key={index}
                                label={tag}
                                size="small"
                            />
                        ))}
                    </View>

                    {children && (
                        <Animated.View style={[styles.childrenContainer, { maxHeight: childrenMaxHeight }]}>
                            {expanded && children}
                        </Animated.View>
                    )}
                </View>
            </Card>
            {showActions && renderActionsMenu()}
        </View>
    );
});