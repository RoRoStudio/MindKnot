import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, TextInput, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { ActivityTemplate, NavigateTarget } from '../../../types/loop';
import { useLoopActions } from '../../../store/loops';

interface ActivityTemplateSelectorProps {
    selectedTemplateIds?: string[];
    onSelectTemplate: (template: ActivityTemplate) => void;
    onDeselectTemplate: (templateId: string) => void;
    maxSelections?: number;
}

interface CreateTemplateModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (template: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ visible, onClose, onSubmit }) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('');
    const [description, setDescription] = useState('');
    const [navigationType, setNavigationType] = useState<'note' | 'action' | 'spark' | 'path' | 'saga'>('note');
    const [navigationMode, setNavigationMode] = useState<'create' | 'review' | 'view' | 'select'>('view');
    const [hasNavigation, setHasNavigation] = useState(false);

    const commonIcons = ['📝', '🏃', '🧘', '📖', '🎯', '💡', '🔍', '⏰', '📋', '🎨', '🎵', '🌱', '💪', '🤸', '💧', '💊'];

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (!icon.trim()) {
            Alert.alert('Error', 'Please select an icon');
            return;
        }

        const template: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
            title: title.trim(),
            icon: icon.trim(),
            description: description.trim() || undefined,
            type: 'custom',
            isPredefined: false,
            navigateTarget: hasNavigation ? {
                type: navigationType,
                mode: navigationMode
            } : undefined
        };

        onSubmit(template);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setIcon('');
        setDescription('');
        setNavigationType('note');
        setNavigationMode('view');
        setHasNavigation(false);
    };

    const modalStyles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: {
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            margin: 20,
            maxHeight: '80%',
            width: '90%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        content: {
            padding: 20,
        },
        section: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        textInput: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
        },
        iconGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
        },
        iconOption: {
            width: 44,
            height: 44,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        iconOptionSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryLight + '20',
        },
        iconText: {
            fontSize: 20,
        },
        navigationSection: {
            marginTop: 12,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        switch: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        switchTrack: {
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.border,
            padding: 2,
        },
        switchTrackActive: {
            backgroundColor: theme.colors.primary,
        },
        switchThumb: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        switchThumbActive: {
            transform: [{ translateX: 20 }],
        },
        optionButtons: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
        },
        optionButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        optionButtonActive: {
            backgroundColor: theme.colors.primaryLight + '20',
            borderColor: theme.colors.primary,
        },
        optionButtonText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: '500',
            textTransform: 'capitalize',
        },
        optionButtonTextActive: {
            color: theme.colors.primary,
        },
        createButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
        },
        createButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.background,
        },
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={modalStyles.overlay}>
                <View style={modalStyles.modal}>
                    <View style={modalStyles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={modalStyles.headerTitle}>Create Template</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.label}>Title *</Text>
                            <TextInput
                                style={modalStyles.textInput}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Activity name"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>

                        <View style={modalStyles.section}>
                            <Text style={modalStyles.label}>Icon *</Text>
                            <View style={modalStyles.iconGrid}>
                                {commonIcons.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={[
                                            modalStyles.iconOption,
                                            icon === emoji && modalStyles.iconOptionSelected
                                        ]}
                                        onPress={() => setIcon(emoji)}
                                    >
                                        <Text style={modalStyles.iconText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={modalStyles.textInput}
                                value={icon}
                                onChangeText={setIcon}
                                placeholder="Or type custom emoji"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>

                        <View style={modalStyles.section}>
                            <Text style={modalStyles.label}>Description (Optional)</Text>
                            <TextInput
                                style={[modalStyles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="What is this activity about?"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                            />
                        </View>

                        <View style={modalStyles.section}>
                            <View style={modalStyles.toggleRow}>
                                <Text style={modalStyles.label}>Navigation Target</Text>
                                <TouchableOpacity
                                    onPress={() => setHasNavigation(!hasNavigation)}
                                    style={modalStyles.switch}
                                >
                                    <View style={[
                                        modalStyles.switchTrack,
                                        hasNavigation && modalStyles.switchTrackActive
                                    ]}>
                                        <View style={[
                                            modalStyles.switchThumb,
                                            hasNavigation && modalStyles.switchThumbActive
                                        ]} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {hasNavigation && (
                                <View style={modalStyles.navigationSection}>
                                    <Text style={[modalStyles.label, { fontSize: 14 }]}>Target Type</Text>
                                    <View style={modalStyles.optionButtons}>
                                        {(['note', 'action', 'spark', 'path', 'saga'] as const).map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    modalStyles.optionButton,
                                                    navigationType === type && modalStyles.optionButtonActive
                                                ]}
                                                onPress={() => setNavigationType(type)}
                                            >
                                                <Text style={[
                                                    modalStyles.optionButtonText,
                                                    navigationType === type && modalStyles.optionButtonTextActive
                                                ]}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={[modalStyles.label, { fontSize: 14, marginTop: 12 }]}>Mode</Text>
                                    <View style={modalStyles.optionButtons}>
                                        {(['create', 'review', 'view', 'select'] as const).map((mode) => (
                                            <TouchableOpacity
                                                key={mode}
                                                style={[
                                                    modalStyles.optionButton,
                                                    navigationMode === mode && modalStyles.optionButtonActive
                                                ]}
                                                onPress={() => setNavigationMode(mode)}
                                            >
                                                <Text style={[
                                                    modalStyles.optionButtonText,
                                                    navigationMode === mode && modalStyles.optionButtonTextActive
                                                ]}>
                                                    {mode}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={modalStyles.createButton} onPress={handleSubmit}>
                            <Text style={modalStyles.createButtonText}>Create Template</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export const ActivityTemplateSelector: React.FC<ActivityTemplateSelectorProps> = ({
    selectedTemplateIds = [],
    onSelectTemplate,
    onDeselectTemplate,
    maxSelections
}) => {
    const { theme } = useTheme();
    const { activityTemplates, loadActivityTemplates, initializePredefinedActivityTemplates, createActivityTemplate } = useLoopActions();
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        initializeData();
    }, []);

    const initializeData = async () => {
        setLoading(true);
        try {
            await initializePredefinedActivityTemplates();
            await loadActivityTemplates();
        } catch (error) {
            console.error('Error loading activity templates:', error);
            Alert.alert('Error', 'Failed to load activity templates');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplatePress = (template: ActivityTemplate) => {
        const isSelected = selectedTemplateIds.includes(template.id);

        if (isSelected) {
            onDeselectTemplate(template.id);
        } else {
            if (maxSelections && selectedTemplateIds.length >= maxSelections) {
                Alert.alert(
                    'Maximum Reached',
                    `You can only select up to ${maxSelections} activities.`
                );
                return;
            }
            onSelectTemplate(template);
        }
    };

    const handleCreateTemplate = async (template: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const success = await createActivityTemplate(template);
            if (success) {
                await loadActivityTemplates();
                Alert.alert('Success', 'Template created successfully');
            } else {
                Alert.alert('Error', 'Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error);
            Alert.alert('Error', 'Failed to create template');
        }
    };

    const styles = StyleSheet.create({
        container: {
            padding: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        createButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: theme.colors.primary + '20',
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        createButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.primary,
            marginLeft: 4,
        },
        templatesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        templateItem: {
            flexBasis: '45%',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
        },
        templateItemSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryLight + '20',
        },
        templateIcon: {
            fontSize: 32,
            marginBottom: 8,
        },
        templateTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: 4,
        },
        templateDescription: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 16,
            marginBottom: 4,
        },
        templateType: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            textTransform: 'capitalize',
        },
        selectedBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: theme.colors.primary,
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        selectionCount: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 12,
        },
        loadingText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            padding: 32,
        },
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading activity templates...</Text>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Activities</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Ionicons name="add" size={16} color={theme.colors.primary} />
                        <Text style={styles.createButtonText}>Create</Text>
                    </TouchableOpacity>
                </View>

                {maxSelections && (
                    <Text style={styles.selectionCount}>
                        {selectedTemplateIds.length} of {maxSelections} selected
                    </Text>
                )}

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.templatesGrid}>
                        {activityTemplates.map((template) => {
                            const isSelected = selectedTemplateIds.includes(template.id);

                            return (
                                <TouchableOpacity
                                    key={template.id}
                                    style={[
                                        styles.templateItem,
                                        isSelected && styles.templateItemSelected,
                                    ]}
                                    onPress={() => handleTemplatePress(template)}
                                    activeOpacity={0.7}
                                >
                                    {isSelected && (
                                        <View style={styles.selectedBadge}>
                                            <Ionicons
                                                name="checkmark"
                                                size={12}
                                                color={theme.colors.background}
                                            />
                                        </View>
                                    )}

                                    <Text style={styles.templateIcon}>{template.icon}</Text>
                                    <Text style={styles.templateTitle}>{template.title}</Text>
                                    {template.description && (
                                        <Text style={styles.templateDescription}>
                                            {template.description}
                                        </Text>
                                    )}
                                    <Text style={styles.templateType}>
                                        {template.type || 'custom'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            <CreateTemplateModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateTemplate}
            />
        </>
    );
}; 