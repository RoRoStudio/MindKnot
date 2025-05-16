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
    Switch,
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Action, SubAction } from '../../types/action';
import { useActions } from '../../hooks/useActions';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { Typography } from '../../components/common/Typography';
import { useCategories } from '../../hooks/useCategories';
import { format } from 'date-fns';
import { getActionById } from '../../services/actionService';
import { RootStackParamList } from '../../types/navigation-types';

// Route params type
type ActionDetailRouteProp = RouteProp<
    {
        ActionDetail: {
            actionId: string;
        };
    },
    'ActionDetail'
>;

type ActionDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ActionDetailScreen() {
    const route = useRoute<ActionDetailRouteProp>();
    const navigation = useNavigation<ActionDetailScreenNavigationProp>();
    const { theme, isDark } = useTheme();
    const { actions, editAction, removeAction, loadActions } = useActions();
    const { categories } = useCategories();

    const [action, setAction] = useState<Action | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [done, setDone] = useState(false);
    const [subActions, setSubActions] = useState<SubAction[]>([]);
    const [newSubAction, setNewSubAction] = useState('');
    const [isSaving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const titleInputRef = useRef<TextInput>(null);
    const bodyInputRef = useRef<TextInput>(null);
    const newSubActionInputRef = useRef<TextInput>(null);

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
        bodyInput: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            padding: 0,
            textAlignVertical: 'top',
            minHeight: 100,
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
            backgroundColor: theme.colors.textDisabled,
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
            marginVertical: theme.spacing.m,
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
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
        },
        statusText: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
        },
        subActionContainer: {
            marginTop: theme.spacing.m,
        },
        subActionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        subActionCheckbox: {
            marginRight: theme.spacing.s,
        },
        subActionText: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        subActionTextCompleted: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
        subActionInput: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            padding: theme.spacing.s,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            borderRadius: theme.shape.radius.s,
            marginTop: theme.spacing.m,
        },
        addSubActionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            marginTop: theme.spacing.s,
            alignSelf: 'flex-start',
        },
        addSubActionText: {
            marginLeft: theme.spacing.xs,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        removeSubActionButton: {
            padding: theme.spacing.s,
        },
    }));

    // Load the action from the ID passed in route params
    useEffect(() => {
        const fetchAction = async () => {
            try {
                setIsLoading(true);
                const { actionId } = route.params;

                // First try to find the action in the already loaded actions
                let foundAction = actions.find(a => a.id === actionId);

                // If not found, try to fetch directly from the database
                if (!foundAction) {
                    console.log(`Action not found in state, fetching with ID: ${actionId}`);
                    const dbAction = await getActionById(actionId);

                    if (dbAction) {
                        foundAction = dbAction;
                    }

                    // Also reload all actions for consistency
                    loadActions();
                }

                if (foundAction) {
                    console.log(`Action found: ${foundAction.title}`);
                    setAction(foundAction);
                    setTitle(foundAction.title);
                    setBody(foundAction.body || '');
                    setDone(foundAction.done || false);
                    setSubActions(foundAction.subActions || []);

                    if (foundAction.dueDate) {
                        setDueDate(new Date(foundAction.dueDate));
                    }
                } else {
                    console.log(`Action with ID ${actionId} not found even in database`);
                    Alert.alert('Error', 'Action not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error loading action:', error);
                Alert.alert('Error', 'Failed to load action');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchAction();
    }, [route.params, actions, navigation, loadActions]);

    // Track changes
    useEffect(() => {
        if (action) {
            const hasBodyChanged = body !== (action.body || '');
            const hasTitleChanged = title !== action.title;
            const hasDueDateChanged =
                (dueDate ? dueDate.toISOString() : null) !==
                (action.dueDate || null);
            const hasDoneStatusChanged = done !== action.done;

            // Compare subactions
            const hasSubActionsChanged =
                JSON.stringify(subActions) !==
                JSON.stringify(action.subActions || []);

            setHasChanges(
                hasBodyChanged ||
                hasTitleChanged ||
                hasDueDateChanged ||
                hasDoneStatusChanged ||
                hasSubActionsChanged
            );
        }
    }, [action, title, body, dueDate, done, subActions]);

    const handleSave = useCallback(() => {
        if (!action) return;

        setSaving(true);

        const updatedAction: Action = {
            ...action,
            title,
            body,
            dueDate: dueDate ? dueDate.toISOString() : undefined,
            done,
            subActions,
            updatedAt: new Date().toISOString(),
        };

        // Call editAction with both ID and updates
        editAction(action.id, {
            title,
            body,
            dueDate: dueDate ? dueDate.toISOString() : undefined,
            done,
            subActions
        });
        setAction(updatedAction);
        setSaving(false);
        setHasChanges(false);

        // Show confirmation
        Alert.alert('Saved', 'Action updated successfully');
    }, [action, title, body, dueDate, done, subActions, editAction]);

    const handleDelete = useCallback(() => {
        if (!action) return;

        Alert.alert(
            'Delete Action',
            'Are you sure you want to delete this action? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        removeAction(action.id);
                        navigation.goBack();
                    }
                }
            ]
        );
    }, [action, removeAction, navigation]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const toggleSubActionStatus = (id: string) => {
        setSubActions(prev =>
            prev.map(item =>
                item.id === id ? { ...item, done: !item.done } : item
            )
        );
    };

    const addSubAction = () => {
        if (!newSubAction.trim()) return;

        const newItem: SubAction = {
            id: Date.now().toString(),
            text: newSubAction.trim(),
            done: false
        };

        setSubActions(prev => [...prev, newItem]);
        setNewSubAction('');
    };

    const removeSubAction = (id: string) => {
        setSubActions(prev => prev.filter(item => item.id !== id));
    };

    if (!action) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Typography variant="h4" style={styles.headerTitle}>
                        {isLoading ? "Loading..." : "Action not found"}
                    </Typography>
                </View>

                {isLoading && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Typography style={{ marginTop: 16 }}>Loading action...</Typography>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    const category = action.categoryId
        ? categories.find(c => c.id === action.categoryId)
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
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
                    <Typography variant="h6">Action Details</Typography>
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
                                handleDelete();
                            }}
                        >
                            <Icon name="trash" size={20} color={theme.colors.error} />
                            <Typography
                                style={[styles.optionText, { color: theme.colors.error }]}
                            >
                                Delete
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
                        placeholder="Action title"
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
                                >
                                    {category.title || 'Category'}
                                </Typography>
                            </View>
                        )}

                        {action.tags?.map(tag => (
                            <View key={tag} style={styles.tag}>
                                <Typography style={styles.tagText}>
                                    #{tag}
                                </Typography>
                            </View>
                        ))}
                    </View>

                    {/* Status toggle */}
                    <View style={styles.statusContainer}>
                        <Typography style={styles.statusText}>
                            {done ? 'Completed' : 'Active'}
                        </Typography>
                        <Switch
                            value={done}
                            onValueChange={setDone}
                            trackColor={{
                                false: theme.colors.divider,
                                true: theme.colors.success + '80'
                            }}
                            thumbColor={done ? theme.colors.success : '#f4f3f4'}
                        />
                    </View>

                    {/* Due date picker */}
                    <TouchableOpacity
                        style={styles.datePicker}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <View style={styles.datePickerButton}>
                            <Icon
                                name="calendar"
                                size={20}
                                color={theme.colors.textPrimary}
                            />
                            <Typography style={styles.dateText}>
                                {dueDate
                                    ? `Due: ${format(dueDate, 'PPP')}`
                                    : 'Set due date'}
                            </Typography>
                        </View>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={dueDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Body input */}
                    <Typography variant="subtitle1" style={styles.sectionTitle}>
                        Notes
                    </Typography>
                    <TextInput
                        ref={bodyInputRef}
                        style={styles.bodyInput}
                        value={body}
                        onChangeText={setBody}
                        placeholder="Add notes about this action..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                    />

                    {/* Sub-actions section */}
                    <Typography variant="subtitle1" style={styles.sectionTitle}>
                        Sub-actions
                    </Typography>

                    <View style={styles.subActionContainer}>
                        {subActions.map(subAction => (
                            <View key={subAction.id} style={styles.subActionItem}>
                                <TouchableOpacity
                                    style={styles.subActionCheckbox}
                                    onPress={() => toggleSubActionStatus(subAction.id)}
                                >
                                    <Icon
                                        name={subAction.done ? "square-check" : "square"}
                                        size={20}
                                        color={subAction.done ? theme.colors.success : theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                                <Typography
                                    style={[
                                        styles.subActionText,
                                        subAction.done && styles.subActionTextCompleted
                                    ]}
                                >
                                    {subAction.text}
                                </Typography>
                                <TouchableOpacity
                                    style={styles.removeSubActionButton}
                                    onPress={() => removeSubAction(subAction.id)}
                                >
                                    <Icon
                                        name="x"
                                        size={18}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Add new sub-action */}
                        <TextInput
                            ref={newSubActionInputRef}
                            style={styles.subActionInput}
                            value={newSubAction}
                            onChangeText={setNewSubAction}
                            placeholder="Add a sub-action..."
                            placeholderTextColor={theme.colors.textSecondary}
                            onSubmitEditing={addSubAction}
                            returnKeyType="done"
                        />

                        <TouchableOpacity
                            style={styles.addSubActionButton}
                            onPress={addSubAction}
                        >
                            <Icon
                                name="plus"
                                size={18}
                                color={theme.colors.textPrimary}
                            />
                            <Typography style={styles.addSubActionText}>
                                Add Sub-action
                            </Typography>
                        </TouchableOpacity>
                    </View>

                    <Typography style={styles.createdText}>
                        Created: {new Date(action.createdAt).toLocaleDateString()}
                        {action.createdAt !== action.updatedAt
                            ? ` • Updated: ${new Date(action.updatedAt).toLocaleDateString()}`
                            : ''
                        }
                    </Typography>

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