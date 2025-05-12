// src/components/common/IconPicker.tsx
import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Icon, IconName } from './Icon';
import { Typography } from './Typography';

interface IconPickerProps {
    selectedIcon: IconName | null;
    onSelectIcon: (icon: IconName) => void;
}

// List of icons to show in the picker
// These are the icons available in the Icon component
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
    'list'
];

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon }) => {
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        container: {
            marginVertical: theme.spacing.m,
        },
        title: {
            marginBottom: theme.spacing.s,
        },
        iconsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            marginHorizontal: -theme.spacing.xs, // To offset the margin of the icon items
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
        iconText: {
            fontSize: theme.typography.fontSize.xs,
            marginTop: 4,
            textAlign: 'center',
        },
        scrollView: {
            maxHeight: 240, // Limit height to ensure it doesn't take up too much space
        },
    }));

    return (
        <View style={styles.container}>
            <Typography variant="h4" style={styles.title}>
                Choose an Icon
            </Typography>

            <ScrollView
                horizontal={false}
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.iconsContainer}>
                    {AVAILABLE_ICONS.map((icon) => (
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
                                color={selectedIcon === icon ? theme.colors.onPrimary : theme.colors.primary}
                            />
                            <Typography
                                variant="caption"
                                style={styles.iconText}
                                color={selectedIcon === icon ? 'primary' : 'inherit'}
                            >
                                {icon.replace('-', ' ')}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default IconPicker;