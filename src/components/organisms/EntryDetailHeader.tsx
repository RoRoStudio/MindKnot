import React, { useState } from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Icon, IconName } from '../common';
import { useStyles } from '../../hooks/useStyles';

/**
 * Props for the EntryDetailHeader component
 */
export interface EntryDetailHeaderProps {
    /**
     * Whether the entry is starred/favorited
     * @default false
     */
    isStarred?: boolean;

    /**
     * Callback when star button is pressed
     */
    onStarPress?: () => void;

    /**
     * Whether to show the edit button
     * @default false
     */
    showEditButton?: boolean;

    /**
     * Callback when edit button is pressed
     */
    onEditPress?: () => void;

    /**
     * Callback when back button is pressed (defaults to navigation.goBack)
     */
    onBackPress?: () => void;

    /**
     * Callback when archive button is pressed
     */
    onArchivePress?: () => void;

    /**
     * Callback when duplicate button is pressed
     */
    onDuplicatePress?: () => void;

    /**
     * Callback when hide button is pressed
     */
    onHidePress?: () => void;

    /**
     * Optional additional styles for the container
     */
    style?: any;

    /**
     * Whether the entry has been saved/created
     * This determines whether to show action buttons
     * @default false
     */
    isSaved?: boolean;

    /**
     * Title to optionally display in the center of the header
     */
    title?: string;
}

/**
 * EntryDetailHeader component provides a standardized header for entry detail screens
 * including back navigation, star/favorite button, edit button, and more actions
 */
export const EntryDetailHeader = React.memo<EntryDetailHeaderProps>(({
    isStarred = false,
    onStarPress,
    showEditButton = false,
    onEditPress,
    onBackPress,
    onArchivePress,
    onDuplicatePress,
    onHidePress,
    style,
    isSaved = false,
    title,
}) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const styles = useStyles((theme) => ({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
            backgroundColor: '#FFFFFF', // White background to match the screen
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        headerLeftSection: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerMiddleSection: {
            flex: 1,
            alignItems: 'center',
        },
        headerRightSection: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButton: {
            padding: theme.spacing.xs,
        },
        actionButton: {
            padding: theme.spacing.s,
            marginLeft: theme.spacing.xs,
        },
        actionsMenu: {
            position: 'absolute',
            right: theme.spacing.m,
            top: 50,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.xs,
            zIndex: 999,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            minWidth: 150,
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
        title: {
            fontWeight: '500',
        },
    }));

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    const toggleActionsMenu = () => {
        setShowActionsMenu(!showActionsMenu);
    };

    return (
        <>
            <StatusBar
                backgroundColor="#FFFFFF"
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
            />
            <View style={[styles.header, style]}>
                <View style={styles.headerLeftSection}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Icon
                            name="arrow-left"
                            width={24}
                            height={24}
                            color={theme.colors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>

                {title && (
                    <View style={styles.headerMiddleSection}>
                        <Typography variant="h6" style={styles.title}>
                            {title}
                        </Typography>
                    </View>
                )}

                <View style={styles.headerRightSection}>
                    {isSaved && (
                        <>
                            <TouchableOpacity
                                onPress={onStarPress}
                                style={styles.actionButton}
                                accessibilityLabel={isStarred ? "Unstar" : "Star"}
                            >
                                <Icon
                                    name={isStarred ? "star" : "star-off"}
                                    width={20}
                                    height={20}
                                    color={isStarred ? "#FFB800" : theme.colors.textPrimary}
                                />
                            </TouchableOpacity>

                            {showEditButton && (
                                <TouchableOpacity
                                    onPress={onEditPress}
                                    style={styles.actionButton}
                                    accessibilityLabel="Edit"
                                >
                                    <Icon
                                        name="pencil"
                                        width={20}
                                        height={20}
                                        color={theme.colors.textPrimary}
                                    />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={toggleActionsMenu}
                                style={styles.actionButton}
                                accessibilityLabel="More options"
                            >
                                <Icon
                                    name="ellipsis-vertical"
                                    width={20}
                                    height={20}
                                    color={theme.colors.textPrimary}
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {showActionsMenu && (
                <View style={styles.actionsMenu}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => {
                            setShowActionsMenu(false);
                            if (onDuplicatePress) onDuplicatePress();
                        }}
                    >
                        <Icon name="copy" width={16} height={16} color={theme.colors.primary} />
                        <Typography style={styles.actionItemText}>Duplicate</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => {
                            setShowActionsMenu(false);
                            if (onArchivePress) onArchivePress();
                        }}
                    >
                        <Icon name="archive" width={16} height={16} color={theme.colors.primary} />
                        <Typography style={styles.actionItemText}>Archive</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => {
                            setShowActionsMenu(false);
                            if (onHidePress) onHidePress();
                        }}
                    >
                        <Icon name="eye-off" width={16} height={16} color={theme.colors.primary} />
                        <Typography style={styles.actionItemText}>Hide</Typography>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}); 