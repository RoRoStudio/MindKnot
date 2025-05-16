import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Path, Milestone } from '../../types/path';
import { usePaths } from '../../hooks/usePaths';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { Typography } from '../../components/common/Typography';
import { useCategories } from '../../hooks/useCategories';
import { getPathById } from '../../services/pathService';
import { RootStackParamList } from '../../types/navigation-types';

type PathDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Route params type
type PathDetailRouteProp = RouteProp<
    {
        PathDetail: {
            pathId: string;
        };
    },
    'PathDetail'
>;

export default function PathDetailScreen() {
    const route = useRoute<PathDetailRouteProp>();
    const navigation = useNavigation<PathDetailScreenNavigationProp>();
    const { theme, isDark } = useTheme();
    const { paths, loadPaths, updatePath } = usePaths();
    const { categories } = useCategories();

    const [path, setPath] = useState<Path | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [newMilestoneName, setNewMilestoneName] = useState('');
    const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const titleInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    const newMilestoneNameInputRef = useRef<TextInput>(null);
    const newMilestoneDescriptionInputRef = useRef<TextInput>(null);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        backButton: {
            padding: theme.spacing.s,
        },
        headerTitle: {
            flex: 1,
            marginLeft: theme.spacing.s,
        },
        optionsButton: {
            padding: theme.spacing.s,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        titleInput: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            padding: 0,
            marginBottom: theme.spacing.m,
        },
        descriptionInput: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            padding: 0,
            textAlignVertical: 'top',
            minHeight: 80,
            marginBottom: theme.spacing.m,
        },
        metadataSection: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.m,
        },
        tag: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
        },
        tagText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        category: {
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
        },
        categoryDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 4,
        },
        categoryText: {
            fontSize: theme.typography.fontSize.s,
        },
        createdText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.m,
        },
        saveButton: {
            position: 'absolute',
            right: theme.spacing.l,
            bottom: theme.spacing.l,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
        },
        saveButtonDisabled: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        optionsMenu: {
            position: 'absolute',
            top: 60,
            right: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.s,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
            zIndex: 1000,
        },
        optionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.s,
        },
        optionText: {
            marginLeft: theme.spacing.s,
            fontSize: theme.typography.fontSize.m,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 999,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.medium,
            marginTop: theme.spacing.l,
            marginBottom: theme.spacing.s,
        },
        datePicker: {
            marginVertical: theme.spacing.s,
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
        },
        datePickerButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dateText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            marginLeft: theme.spacing.s,
        },
        datesContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.m,
        },
        datePickerContainer: {
            flex: 1,
            marginRight: theme.spacing.s,
        },
        datePickerContainerRight: {
            flex: 1,
            marginLeft: theme.spacing.s,
        },
        milestoneItem: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        milestoneHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        milestoneTitle: {
            flex: 1,
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        milestoneDescription: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
        },
        actionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            marginTop: theme.spacing.s,
        },
        actionCheckbox: {
            marginRight: theme.spacing.s,
        },
        actionText: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        actionTextCompleted: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
        actionsList: {
            marginTop: theme.spacing.m,
        },
        addMilestoneContainer: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        inputLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
        },
        milestoneInput: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.background,
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.s,
            marginBottom: theme.spacing.s,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: theme.spacing.s,
        },
        cancelButton: {
            padding: theme.spacing.s,
            marginRight: theme.spacing.m,
        },
        addButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
        },
        addButtonText: {
            color: theme.colors.onPrimary,
            fontSize: theme.typography.fontSize.m,
            marginLeft: theme.spacing.xs,
        },
        addMilestoneButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            borderStyle: 'dashed',
            justifyContent: 'center',
            marginBottom: theme.spacing.m,
        },
        addMilestoneButtonText: {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.m,
            marginLeft: theme.spacing.s,
        },
        milestoneActions: {
            flexDirection: 'row',
            marginLeft: theme.spacing.s,
        },
        milestoneAction: {
            padding: theme.spacing.xs,
            marginLeft: theme.spacing.xs,
        },
        progressBar: {
            height: 8,
            backgroundColor: theme.colors.divider,
            borderRadius: 4,
            marginVertical: theme.spacing.m,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
        },
        progressText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            marginTop: theme.spacing.xs,
        },
        subSectionTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.s,
        },
    }));

    // Load the path from the ID passed in route params
    useEffect(() => {
        const fetchPath = async () => {
            try {
                setIsLoading(true);
                const { pathId } = route.params;

                // First try to find the path in the already loaded paths
                let foundPath = paths.find(p => p.id === pathId);

                // If not found, try to fetch directly from the database
                if (!foundPath) {
                    console.log(`Path not found in state, fetching with ID: ${pathId}`);
                    const dbPath = await getPathById(pathId);

                    if (dbPath) {
                        foundPath = dbPath;
                    }

                    // Also reload all paths for consistency
                    loadPaths();
                }

                if (foundPath) {
                    console.log(`Path found: ${foundPath.title}`);
                    setPath(foundPath);
                    setTitle(foundPath.title);
                    setDescription(foundPath.description || '');
                    setMilestones(foundPath.milestones || []);

                    // Initialize expanded state for milestones
                    const initialExpandedState: Record<string, boolean> = {};
                    foundPath.milestones?.forEach(milestone => {
                        initialExpandedState[milestone.id] = false;
                    });
                    setExpandedMilestones(initialExpandedState);

                    if (foundPath.startDate) {
                        setStartDate(new Date(foundPath.startDate));
                    }

                    if (foundPath.targetDate) {
                        setTargetDate(new Date(foundPath.targetDate));
                    }
                } else {
                    console.log(`Path with ID ${pathId} not found even in database`);
                    Alert.alert('Error', 'Path not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error loading path:', error);
                Alert.alert('Error', 'Failed to load path');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchPath();
    }, [route.params, paths, navigation, loadPaths]);

    // Track changes
    useEffect(() => {
        if (path) {
            const hasDescriptionChanged = description !== (path.description || '');
            const hasTitleChanged = title !== path.title;
            const hasStartDateChanged =
                (startDate ? startDate.toISOString() : null) !==
                (path.startDate || null);
            const hasTargetDateChanged =
                (targetDate ? targetDate.toISOString() : null) !==
                (path.targetDate || null);

            // Compare milestones
            const hasMilestonesChanged =
                JSON.stringify(milestones) !==
                JSON.stringify(path.milestones || []);

            setHasChanges(
                hasDescriptionChanged ||
                hasTitleChanged ||
                hasStartDateChanged ||
                hasTargetDateChanged ||
                hasMilestonesChanged
            );
        }
    }, [path, title, description, startDate, targetDate, milestones]);

    // Update path details
    const handleSave = useCallback(() => {
        if (!path) return;

        setSaving(true);

        const updatedPath: Omit<Path, 'id' | 'createdAt' | 'updatedAt'> = {
            type: 'path',
            title,
            description,
            startDate: startDate ? startDate.toISOString() : undefined,
            targetDate: targetDate ? targetDate.toISOString() : undefined,
            milestones,
            tags: path.tags || []
        };

        updatePath(path.id, updatedPath)
            .then((success: boolean) => {
                if (success) {
                    setPath({ ...path, ...updatedPath });
                    setHasChanges(false);
                    Alert.alert('Saved', 'Path updated successfully');
                } else {
                    Alert.alert('Error', 'Failed to save path. Please try again.');
                }
                setSaving(false);
            })
            .catch((error: Error) => {
                console.error('Error saving path:', error);
                Alert.alert('Error', 'An unexpected error occurred');
                setSaving(false);
            });
    }, [path, title, description, startDate, targetDate, milestones, updatePath]);

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const handleTargetDateChange = (event: any, selectedDate?: Date) => {
        setShowTargetDatePicker(false);
        if (selectedDate) {
            setTargetDate(selectedDate);
        }
    };

    const toggleMilestoneExpansion = (id: string) => {
        setExpandedMilestones(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const addMilestone = () => {
        if (!newMilestoneName.trim()) return;

        const newMilestone: Milestone = {
            id: Date.now().toString(),
            pathId: path?.id || '',
            title: newMilestoneName.trim(),
            description: newMilestoneDescription.trim() || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            actions: []
        };

        setMilestones(prev => [...prev, newMilestone]);
        setNewMilestoneName('');
        setNewMilestoneDescription('');
        setIsAddingMilestone(false);
    };

    const updateMilestone = (id: string, data: Partial<Milestone>) => {
        setMilestones(prev =>
            prev.map(milestone =>
                milestone.id === id
                    ? { ...milestone, ...data, updatedAt: new Date().toISOString() }
                    : milestone
            )
        );
    };

    const startEditingMilestone = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setNewMilestoneName(milestone.title);
        setNewMilestoneDescription(milestone.description || '');
    };

    const saveMilestoneEdit = () => {
        if (!editingMilestone || !newMilestoneName.trim()) return;

        updateMilestone(editingMilestone.id, {
            title: newMilestoneName.trim(),
            description: newMilestoneDescription.trim() || undefined
        });

        setEditingMilestone(null);
        setNewMilestoneName('');
        setNewMilestoneDescription('');
    };

    const deleteMilestone = (id: string) => {
        Alert.alert(
            'Delete Milestone',
            'Are you sure you want to delete this milestone? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setMilestones(prev => prev.filter(milestone => milestone.id !== id));
                    }
                }
            ]
        );
    };

    const toggleActionStatus = (milestoneId: string, actionId: string) => {
        setMilestones(prev =>
            prev.map(milestone => {
                if (milestone.id !== milestoneId) return milestone;

                return {
                    ...milestone,
                    actions: milestone.actions?.map(action =>
                        action.id === actionId
                            ? { ...action, done: !action.done }
                            : action
                    )
                };
            })
        );
    };

    // Calculate the path completion percentage
    const calculateProgress = () => {
        if (!milestones || milestones.length === 0) return 0;

        let totalActions = 0;
        let completedActions = 0;

        milestones.forEach(milestone => {
            if (milestone.actions && milestone.actions.length > 0) {
                totalActions += milestone.actions.length;
                completedActions += milestone.actions.filter(action => action.done).length;
            }
        });

        return totalActions ? Math.round((completedActions / totalActions) * 100) : 0;
    };

    if (!path) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Typography variant="h4" style={styles.headerTitle}>
                        {isLoading ? "Loading..." : "Path not found"}
                    </Typography>
                </View>

                {isLoading && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Typography style={{ marginTop: 16 }}>Loading path...</Typography>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    const progress = calculateProgress();
    const category = path.categoryId
        ? categories.find(c => c.id === path.categoryId)
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={'light-content'}
                backgroundColor={theme.colors.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerTitle}>
                    <Typography variant="h6">Path Details</Typography>
                </View>

                <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => setShowOptions(!showOptions)}
                >
                    <Icon name="ellipsis-vertical" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Options menu */}
            {showOptions && (
                <>
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={() => setShowOptions(false)}
                    />
                    <View style={styles.optionsMenu}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                setShowOptions(false);
                                navigation.navigate('ActionScreen', {
                                    mode: 'create',
                                    parentId: path.id,
                                    parentType: 'path'
                                });
                            }}
                        >
                            <Icon name="circle-plus" size={20} color={theme.colors.primary} />
                            <Typography
                                style={[styles.optionText, { color: theme.colors.primary }]}
                            >
                                Add Action
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title input */}
                    <TextInput
                        ref={titleInputRef}
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Path title"
                        placeholderTextColor={theme.colors.textSecondary}
                    />

                    {/* Metadata (category, tags) */}
                    <View style={styles.metadataSection}>
                        {category && (
                            <View
                                style={[
                                    styles.category,
                                    { backgroundColor: category.color + '40' }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.categoryDot,
                                        { backgroundColor: category.color }
                                    ]}
                                />
                                <Typography
                                    style={styles.categoryText}
                                    color={theme.colors.textPrimary}
                                >
                                    {category.title}
                                </Typography>
                            </View>
                        )}

                        {path.tags?.map(tag => (
                            <View key={tag} style={styles.tag}>
                                <Typography style={styles.tagText}>
                                    #{tag}
                                </Typography>
                            </View>
                        ))}
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Typography style={styles.progressText}>
                        {progress}% complete
                    </Typography>

                    {/* Description input */}
                    <TextInput
                        ref={descriptionInputRef}
                        style={styles.descriptionInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add a description..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                    />

                    {/* Date pickers */}
                    <View style={styles.datesContainer}>
                        <View style={styles.datePickerContainer}>
                            <TouchableOpacity
                                style={styles.datePicker}
                                onPress={() => setShowStartDatePicker(true)}
                            >
                                <View style={styles.datePickerButton}>
                                    <Icon
                                        name="calendar"
                                        size={20}
                                        color={theme.colors.textPrimary}
                                    />
                                    <Typography style={styles.dateText}>
                                        {startDate
                                            ? `Start: ${format(startDate, 'PP')}`
                                            : 'Set start date'}
                                    </Typography>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.datePickerContainerRight}>
                            <TouchableOpacity
                                style={styles.datePicker}
                                onPress={() => setShowTargetDatePicker(true)}
                            >
                                <View style={styles.datePickerButton}>
                                    <Icon
                                        name="flag"
                                        size={20}
                                        color={theme.colors.textPrimary}
                                    />
                                    <Typography style={styles.dateText}>
                                        {targetDate
                                            ? `Target: ${format(targetDate, 'PP')}`
                                            : 'Set target date'}
                                    </Typography>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStartDatePicker && (
                        <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleStartDateChange}
                        />
                    )}

                    {showTargetDatePicker && (
                        <DateTimePicker
                            value={targetDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleTargetDateChange}
                        />
                    )}

                    <Typography style={styles.createdText}>
                        Created: {new Date(path.createdAt).toLocaleDateString()}
                        {path.createdAt !== path.updatedAt
                            ? ` • Updated: ${new Date(path.updatedAt).toLocaleDateString()}`
                            : ''
                        }
                    </Typography>

                    {/* Milestones Section */}
                    <Typography variant="subtitle1" style={styles.sectionTitle}>
                        Milestones
                    </Typography>

                    {/* Milestone List */}
                    {milestones.map(milestone => (
                        <View key={milestone.id} style={styles.milestoneItem}>
                            {editingMilestone && editingMilestone.id === milestone.id ? (
                                // Editing mode
                                <>
                                    <Typography style={styles.inputLabel}>Title</Typography>
                                    <TextInput
                                        ref={newMilestoneNameInputRef}
                                        style={styles.milestoneInput}
                                        value={newMilestoneName}
                                        onChangeText={setNewMilestoneName}
                                        placeholder="Milestone title"
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />

                                    <Typography style={styles.inputLabel}>Description</Typography>
                                    <TextInput
                                        ref={newMilestoneDescriptionInputRef}
                                        style={styles.milestoneInput}
                                        value={newMilestoneDescription}
                                        onChangeText={setNewMilestoneDescription}
                                        placeholder="Milestone description"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        multiline
                                    />

                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setEditingMilestone(null);
                                                setNewMilestoneName('');
                                                setNewMilestoneDescription('');
                                            }}
                                        >
                                            <Typography color={theme.colors.textSecondary}>
                                                Cancel
                                            </Typography>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={saveMilestoneEdit}
                                        >
                                            <Typography style={styles.addButtonText}>
                                                Save
                                            </Typography>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                // Display mode
                                <>
                                    <View style={styles.milestoneHeader}>
                                        <TouchableOpacity
                                            onPress={() => toggleMilestoneExpansion(milestone.id)}
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                        >
                                            <Typography style={styles.milestoneTitle}>
                                                {milestone.title}
                                            </Typography>
                                            <Icon
                                                name={expandedMilestones[milestone.id] ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color={theme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>

                                        <View style={styles.milestoneActions}>
                                            <TouchableOpacity
                                                style={styles.milestoneAction}
                                                onPress={() => startEditingMilestone(milestone)}
                                            >
                                                <Icon
                                                    name="pencil"
                                                    size={16}
                                                    color={theme.colors.textSecondary}
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.milestoneAction}
                                                onPress={() => deleteMilestone(milestone.id)}
                                            >
                                                <Icon
                                                    name="trash-2"
                                                    size={16}
                                                    color={theme.colors.error}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {milestone.description && (
                                        <Typography style={styles.milestoneDescription}>
                                            {milestone.description}
                                        </Typography>
                                    )}

                                    {expandedMilestones[milestone.id] && milestone.actions && milestone.actions.length > 0 && (
                                        <View style={styles.actionsList}>
                                            {milestone.actions.map(action => (
                                                <View key={action.id} style={styles.actionItem}>
                                                    <TouchableOpacity
                                                        style={styles.actionCheckbox}
                                                        onPress={() => toggleActionStatus(milestone.id, action.id)}
                                                    >
                                                        <Icon
                                                            name={action.done ? "square-check" : "square"}
                                                            size={20}
                                                            color={action.done ? theme.colors.success : theme.colors.textSecondary}
                                                        />
                                                    </TouchableOpacity>
                                                    <Typography
                                                        style={[
                                                            styles.actionText,
                                                            action.done && styles.actionTextCompleted
                                                        ]}
                                                    >
                                                        {action.name}
                                                    </Typography>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    ))}

                    {/* Add Milestone Form */}
                    {isAddingMilestone ? (
                        <View style={styles.addMilestoneContainer}>
                            <Typography style={styles.inputLabel}>Title</Typography>
                            <TextInput
                                ref={newMilestoneNameInputRef}
                                style={styles.milestoneInput}
                                value={newMilestoneName}
                                onChangeText={setNewMilestoneName}
                                placeholder="Milestone title"
                                placeholderTextColor={theme.colors.textSecondary}
                            />

                            <Typography style={styles.inputLabel}>Description (optional)</Typography>
                            <TextInput
                                ref={newMilestoneDescriptionInputRef}
                                style={styles.milestoneInput}
                                value={newMilestoneDescription}
                                onChangeText={setNewMilestoneDescription}
                                placeholder="Milestone description"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setIsAddingMilestone(false);
                                        setNewMilestoneName('');
                                        setNewMilestoneDescription('');
                                    }}
                                >
                                    <Typography color={theme.colors.textSecondary}>
                                        Cancel
                                    </Typography>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={addMilestone}
                                >
                                    <Icon
                                        name="plus"
                                        size={16}
                                        color={theme.colors.onPrimary}
                                    />
                                    <Typography style={styles.addButtonText}>
                                        Add Milestone
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addMilestoneButton}
                            onPress={() => setIsAddingMilestone(true)}
                        >
                            <Icon
                                name="plus"
                                size={20}
                                color={theme.colors.textPrimary}
                            />
                            <Typography style={styles.addMilestoneButtonText}>
                                Add New Milestone
                            </Typography>
                        </TouchableOpacity>
                    )}

                    {/* Add padding at the bottom for FAB */}
                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save button */}
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    (!hasChanges || isSaving) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!hasChanges || isSaving}
            >
                <Icon
                    name="check"
                    size={24}
                    color={theme.colors.onPrimary}
                />
            </TouchableOpacity>
        </SafeAreaView>
    );
} 