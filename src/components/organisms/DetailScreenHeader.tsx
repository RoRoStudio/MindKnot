import React from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Icon, IconName } from '../common';
import { useStyles } from '../../hooks/useStyles';

/**
 * Props for the DetailScreenHeader component
 */
export interface DetailScreenHeaderProps {
    /**
     * Title to be displayed in the header
     */
    title: string;

    /**
     * Optional subtitle to display below the title
     */
    subtitle?: string;

    /**
     * Optional icon to display beside the title
     */
    iconName?: IconName;

    /**
     * Color for the icon (defaults to primary color)
     */
    iconColor?: string;

    /**
     * Whether to display an edit button
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
     * Optional right action buttons
     */
    rightActions?: React.ReactNode;

    /**
     * Optional additional styles for the container
     */
    style?: any;
}

/**
 * DetailScreenHeader component provides a standardized header for detail screens
 * including back navigation, title with optional icon, and action buttons
 */
export const DetailScreenHeader = React.memo<DetailScreenHeaderProps>(({
    title,
    subtitle,
    iconName,
    iconColor,
    showEditButton = false,
    onEditPress,
    onBackPress,
    rightActions,
    style,
}) => {
    const navigation = useNavigation();
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            backgroundColor: theme.colors.background,
        },
        backButton: {
            marginRight: theme.spacing.m,
            padding: theme.spacing.xs,
        },
        headerContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        titleContainer: {
            flex: 1,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerIcon: {
            marginRight: theme.spacing.s,
        },
        subtitle: {
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
        actionButton: {
            padding: theme.spacing.s,
            marginLeft: theme.spacing.s,
        },
        actionsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
    }));

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    return (
        <>
            <StatusBar
                backgroundColor={theme.colors.background}
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
            />
            <View style={[styles.header, style]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Icon
                        name="arrow-left"
                        width={24}
                        height={24}
                        color={theme.colors.textPrimary}
                    />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <View style={styles.titleRow}>
                            {iconName && (
                                <Icon
                                    name={iconName}
                                    width={24}
                                    height={24}
                                    color={iconColor || theme.colors.primary}
                                    style={styles.headerIcon}
                                />
                            )}
                            <Typography variant="h6" numberOfLines={1}>
                                {title}
                            </Typography>
                        </View>

                        {subtitle && (
                            <Typography variant="caption" style={styles.subtitle}>
                                {subtitle}
                            </Typography>
                        )}
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    {rightActions}

                    {showEditButton && (
                        <TouchableOpacity onPress={onEditPress} style={styles.actionButton}>
                            <Icon
                                name="pencil"
                                width={22}
                                height={22}
                                color={theme.colors.textPrimary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
}); 