import React, { useState, useMemo } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Icon, IconName } from '../atoms/Icon';

/**
 * Props for the IconPicker component
 */
export interface IconPickerProps {
    /**
     * Currently selected icon
     */
    selectedIcon: IconName | null;

    /**
     * Function to call when an icon is selected
     */
    onSelectIcon: (icon: IconName) => void;
}

/**
 * Available icons for selection
 */
const AVAILABLE_ICONS: IconName[] = [
    'lightbulb',
    'git-branch',
    'sparkles',
    'map',
    'file-text',
    'check',
    'link',
    'settings',
    'sun',
    'moon',
    'plus',
    'list',
    'circle-help',
    'compass',
    'calendar-sync',
    'scroll-text',
];

/**
 * IconPicker component provides a searchable grid of icon options for selection
 */
export const IconPicker = React.memo<IconPickerProps>(({
    selectedIcon,
    onSelectIcon
}) => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');

    const styles = useStyles((theme) => ({
        container: {
            marginVertical: theme.spacing.m,
        },
        searchBar: {
            height: 40,
            borderRadius: theme.shape.radius.m,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.s,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        iconsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            marginHorizontal: -theme.spacing.xs,
        },
        iconItem: {
            width: 60,
            height: 60,
            margin: theme.spacing.xs,
            borderRadius: theme.shape.radius.m,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        selectedIconItem: {
            backgroundColor: theme.colors.primaryLight,
        },
        scrollView: {
            maxHeight: 4 * 60 + 3 * theme.spacing.xs * 2, // 4 rows + margins
        },
    }));

    const filteredIcons = useMemo(() => {
        return AVAILABLE_ICONS.filter((icon) =>
            icon.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search icons..."
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={setSearchTerm}
                value={searchTerm}
            />

            <ScrollView
                horizontal={false}
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.iconsContainer}>
                    {filteredIcons.map((icon) => (
                        <TouchableOpacity
                            key={icon}
                            style={[
                                styles.iconItem,
                                selectedIcon === icon && styles.selectedIconItem,
                            ]}
                            onPress={() => onSelectIcon(icon)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name={icon}
                                width={24}
                                height={24}
                                color={
                                    selectedIcon === icon
                                        ? theme.colors.onPrimary
                                        : theme.colors.primary
                                }
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}); 