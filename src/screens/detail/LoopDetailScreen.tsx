import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Switch,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loop, LoopItem } from '../../types/loop';
import { useLoops } from '../../hooks/useLoops';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { Typography } from '../../components/common/Typography';
import { useCategories } from '../../hooks/useCategories';
import { format } from 'date-fns';
import { getLoopById } from '../../services/loopService';
import { RootStackParamList } from '../../types/navigation-types';

// Route params type
type LoopDetailRouteProp = RouteProp<
    {
        LoopDetail: {
            loopId: string;
        };
    },
    'LoopDetail'
>;

type LoopDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Time options for frequency
const FREQUENCY_OPTIONS = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Custom', value: 'custom' },
];

// Days of the week
const DAYS_OF_WEEK = [
    { label: 'Mon', value: 'mon' },
    { label: 'Tue', value: 'tue' },
    { label: 'Wed', value: 'wed' },
    { label: 'Thu', value: 'thu' },
    { label: 'Fri', value: 'fri' },
    { label: 'Sat', value: 'sat' },
    { label: 'Sun', value: 'sun' },
];

export default function LoopDetailScreen() {
    const route = useRoute<LoopDetailRouteProp>();
    const navigation = useNavigation<LoopDetailScreenNavigationProp>();
    const { theme, isDark } = useTheme();
    const { loops, updateLoop, loadLoops } = useLoops();
    const { categories } = useCategories();

    const [loop, setLoop] = useState<Loop | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    const [startTimeByDay, setStartTimeByDay] = useState<Record<string, string>>({});
    const [items, setItems] = useState<LoopItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemDuration, setItemDuration] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [showAddItem, setShowAddItem] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const titleInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    const newItemNameInputRef = useRef<TextInput>(null);

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
        frequencyContainer: {
            marginVertical: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
        },
        frequencyTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing.s,
        },
        frequencyOptionsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.s,
        },
        frequencyOption: {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            marginRight: theme.spacing.s,
            marginBottom: theme.spacing.s,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },
        frequencyOptionSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        frequencyOptionText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
        },
        frequencyOptionTextSelected: {
            color: theme.colors.onPrimary,
        },
        daysSelectorContainer: {
            marginTop: theme.spacing.s,
        },
        daysRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.s,
        },
        dayButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },
        dayButtonSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        dayButtonText: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
        },
        dayButtonTextSelected: {
            color: theme.colors.onPrimary,
        },
        timeSlotsContainer: {
            marginTop: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            paddingTop: theme.spacing.m,
        },
        timeSlot: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        timeSlotDay: {
            width: 50,
            fontSize: theme.typography.fontSize.s,
        },
        timeInput: {
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.s,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
        },
        loopItem: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        loopItemHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        loopItemTitle: {
            flex: 1,
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        loopItemDescription: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
        },
        loopItemActions: {
            flexDirection: 'row',
            marginLeft: theme.spacing.s,
        },
        loopItemAction: {
            padding: theme.spacing.xs,
            marginLeft: theme.spacing.xs,
        },
        loopItemMeta: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
        },
        loopItemMetaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: theme.spacing.m,
            marginTop: theme.spacing.xs,
        },
        loopItemMetaText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
        },
        addItemContainer: {
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
        itemInput: {
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
        addItemButton: {
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
        addItemButtonText: {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.m,
            marginLeft: theme.spacing.s,
        },
        categoryContentText: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
    }));

    // Load the loop from the ID passed in route params
    useEffect(() => {
        const fetchLoop = async () => {
            try {
                setIsLoading(true);
                const { loopId } = route.params;

                // First try to find the loop in the already loaded loops
                let foundLoop = loops.find(l => l.id === loopId);

                // If not found, try to fetch directly from the database
                if (!foundLoop) {
                    console.log(`Loop not found in state, fetching with ID: ${loopId}`);
                    const dbLoop = await getLoopById(loopId);

                    if (dbLoop) {
                        foundLoop = dbLoop;
                    }

                    // Also reload all loops for consistency
                    loadLoops();
                }

                if (foundLoop) {
                    console.log(`Loop found: ${foundLoop.title}`);
                    setLoop(foundLoop);
                    setTitle(foundLoop.title);
                    setDescription(foundLoop.description || '');
                    setFrequency(foundLoop.frequency || 'daily');
                    setItems(foundLoop.items || []);

                    if (foundLoop.startTimeByDay) {
                        setStartTimeByDay(foundLoop.startTimeByDay);
                    }
                } else {
                    console.log(`Loop with ID ${loopId} not found even in database`);
                    Alert.alert('Error', 'Loop not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error loading loop:', error);
                Alert.alert('Error', 'Failed to load loop');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoop();
    }, [route.params, loops, navigation, loadLoops]);

    // Track changes
    useEffect(() => {
        if (loop) {
            const hasDescriptionChanged = description !== (loop.description || '');
            const hasTitleChanged = title !== loop.title;

            // Compare frequency
            let currentFrequency = '';
            try {
                const freqData = JSON.parse(loop.frequency);
                currentFrequency = JSON.stringify({
                    type: freqData.type,
                    days: freqData.days || []
                });
            } catch (e) {
                console.error('Error parsing current frequency:', e);
            }

            const newFrequency = JSON.stringify({
                type: frequency,
                days: selectedDays
            });

            const hasFrequencyChanged = currentFrequency !== newFrequency;

            // Compare items
            const hasItemsChanged =
                JSON.stringify(items) !==
                JSON.stringify(loop.items || []);

            setHasChanges(
                hasDescriptionChanged ||
                hasTitleChanged ||
                hasFrequencyChanged ||
                hasItemsChanged
            );
        }
    }, [loop, title, description, frequency, selectedDays, items]);

    const handleSave = useCallback(() => {
        if (!loop) return;

        setSaving(true);

        const frequencyData = {
            type: frequency,
            days: selectedDays
        };

        const updatedLoop: Loop = {
            ...loop,
            title,
            description,
            frequency: JSON.stringify(frequencyData),
            items,
            updatedAt: new Date().toISOString(),
        };

        updateLoop(loop.id, updatedLoop)
            .then(() => {
                setLoop(updatedLoop);
                setSaving(false);
                setHasChanges(false);

                // Show confirmation
                Alert.alert('Saved', 'Loop updated successfully');
            })
            .catch((error: Error) => {
                console.error('Error updating loop:', error);
                Alert.alert('Error', 'Failed to update loop');
                setSaving(false);
            });
    }, [loop, title, description, frequency, selectedDays, items, updateLoop]);

    const handleDelete = useCallback(() => {
        if (!loop) return;

        Alert.alert(
            'Delete Loop',
            'Are you sure you want to delete this loop? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Just navigate back for now - deletion functionality will be added separately
                        navigation.goBack();
                    }
                }
            ]
        );
    }, [loop, navigation]);

    const toggleDaySelection = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const addItem = () => {
        if (!itemName.trim()) return;

        const newItem: LoopItem = {
            id: Date.now().toString(),
            loopId: loop?.id || '',
            name: itemName.trim(),
            description: itemDescription.trim() || undefined,
            durationMinutes: itemDuration ? parseInt(itemDuration) : undefined,
            quantity: itemQuantity ? itemQuantity : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setItems(prev => [...prev, newItem]);
        resetItemForm();
    };

    const updateItem = () => {
        if (!selectedItemId || !itemName.trim()) return;

        setItems(prev =>
            prev.map(item =>
                item.id === selectedItemId
                    ? {
                        ...item,
                        name: itemName.trim(),
                        description: itemDescription.trim() || undefined,
                        durationMinutes: itemDuration ? parseInt(itemDuration) : undefined,
                        quantity: itemQuantity ? itemQuantity : undefined,
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        );

        resetItemForm();
    };

    const startEditingItem = (item: LoopItem) => {
        setSelectedItemId(item.id);
        setItemName(item.name);
        setItemDescription(item.description || '');
        setItemDuration(item.durationMinutes?.toString() || '');
        setItemQuantity(item.quantity?.toString() || '');
        setShowAddItem(true);
    };

    const deleteItem = (id: string) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setItems(prev => prev.filter(item => item.id !== id));
                    }
                }
            ]
        );
    };

    const resetItemForm = () => {
        setItemName('');
        setItemDescription('');
        setItemDuration('');
        setItemQuantity('');
        setShowAddItem(false);
        setSelectedItemId(null);
    };

    if (!loop) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Typography variant="h4" style={styles.headerTitle}>
                        {isLoading ? "Loading..." : "Loop not found"}
                    </Typography>
                </View>

                {isLoading && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Typography style={{ marginTop: 16 }}>Loading loop...</Typography>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    const category = loop.categoryId
        ? categories.find(c => c.id === loop.categoryId)
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
                    <Typography variant="h6">Loop Details</Typography>
                </View>

                <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => {
                        // Implement options menu
                    }}
                >
                    <Icon name="ellipsis-vertical" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>

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
                        placeholder="Loop title"
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

                        {loop.tags?.map(tag => (
                            <View key={tag} style={styles.tag}>
                                <Typography style={styles.tagText}>
                                    #{tag}
                                </Typography>
                            </View>
                        ))}
                    </View>

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

                    {/* Frequency section */}
                    <View style={styles.frequencyContainer}>
                        <Typography style={styles.frequencyTitle}>
                            Repeat Frequency
                        </Typography>

                        <View style={styles.frequencyOptionsContainer}>
                            {FREQUENCY_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.frequencyOption,
                                        frequency === option.value && styles.frequencyOptionSelected
                                    ]}
                                    onPress={() => setFrequency(option.value)}
                                >
                                    <Typography
                                        style={[
                                            styles.frequencyOptionText,
                                            frequency === option.value && styles.frequencyOptionTextSelected
                                        ]}
                                    >
                                        {option.label}
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Day selector */}
                        {(frequency === 'daily' || frequency === 'weekly') && (
                            <View style={styles.daysSelectorContainer}>
                                <Typography style={styles.inputLabel}>
                                    {frequency === 'daily' ? 'Active Days' : 'Repeat On'}
                                </Typography>

                                <View style={styles.daysRow}>
                                    {DAYS_OF_WEEK.map(day => (
                                        <TouchableOpacity
                                            key={day.value}
                                            style={[
                                                styles.dayButton,
                                                selectedDays.includes(day.value) && styles.dayButtonSelected
                                            ]}
                                            onPress={() => toggleDaySelection(day.value)}
                                        >
                                            <Typography
                                                style={[
                                                    styles.dayButtonText,
                                                    selectedDays.includes(day.value) && styles.dayButtonTextSelected
                                                ]}
                                            >
                                                {day.label}
                                            </Typography>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Loop Items Section */}
                    <Typography variant="subtitle1" style={styles.sectionTitle}>
                        Loop Items
                    </Typography>

                    {/* Loop Items List */}
                    {items.map(item => (
                        <View key={item.id} style={styles.loopItem}>
                            <View style={styles.loopItemHeader}>
                                <Typography style={styles.loopItemTitle}>
                                    {item.name}
                                </Typography>

                                <View style={styles.loopItemActions}>
                                    <TouchableOpacity
                                        style={styles.loopItemAction}
                                        onPress={() => startEditingItem(item)}
                                    >
                                        <Icon
                                            name="pencil"
                                            size={16}
                                            color={theme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.loopItemAction}
                                        onPress={() => deleteItem(item.id)}
                                    >
                                        <Icon
                                            name="trash-2"
                                            size={16}
                                            color={theme.colors.error}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {item.description && (
                                <Typography style={styles.loopItemDescription}>
                                    {item.description}
                                </Typography>
                            )}

                            <View style={styles.loopItemMeta}>
                                {item.durationMinutes && (
                                    <View style={styles.loopItemMetaItem}>
                                        <Icon
                                            name="clock"
                                            size={14}
                                            color={theme.colors.textSecondary}
                                        />
                                        <Typography style={styles.loopItemMetaText}>
                                            {item.durationMinutes} min
                                        </Typography>
                                    </View>
                                )}

                                {item.quantity && (
                                    <View style={styles.loopItemMetaItem}>
                                        <Icon
                                            name="hash"
                                            size={14}
                                            color={theme.colors.textSecondary}
                                        />
                                        <Typography style={styles.loopItemMetaText}>
                                            {item.quantity}
                                        </Typography>
                                    </View>
                                )}

                                {item.actionIds && item.actionIds.length > 0 && (
                                    <View style={styles.loopItemMetaItem}>
                                        <Icon
                                            name="square-check"
                                            size={14}
                                            color={theme.colors.textSecondary}
                                        />
                                        <Typography style={styles.loopItemMetaText}>
                                            {item.actionIds.length} action{item.actionIds.length > 1 ? 's' : ''}
                                        </Typography>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}

                    {/* Add Item Form */}
                    {showAddItem ? (
                        <View style={styles.addItemContainer}>
                            <Typography style={styles.inputLabel}>Name</Typography>
                            <TextInput
                                ref={newItemNameInputRef}
                                style={styles.itemInput}
                                value={itemName}
                                onChangeText={setItemName}
                                placeholder="Item name"
                                placeholderTextColor={theme.colors.textSecondary}
                            />

                            <Typography style={styles.inputLabel}>Description (optional)</Typography>
                            <TextInput
                                style={styles.itemInput}
                                value={itemDescription}
                                onChangeText={setItemDescription}
                                placeholder="Item description"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                            />

                            <Typography style={styles.inputLabel}>Duration in minutes (optional)</Typography>
                            <TextInput
                                style={styles.itemInput}
                                value={itemDuration}
                                onChangeText={text => {
                                    // Only allow numbers
                                    if (/^\d*$/.test(text)) {
                                        setItemDuration(text);
                                    }
                                }}
                                placeholder="Duration"
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="numeric"
                            />

                            <Typography style={styles.inputLabel}>Quantity (optional)</Typography>
                            <TextInput
                                style={styles.itemInput}
                                value={itemQuantity}
                                onChangeText={setItemQuantity}
                                placeholder="Quantity"
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="numeric"
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={resetItemForm}
                                >
                                    <Typography color={theme.colors.textSecondary}>
                                        Cancel
                                    </Typography>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={selectedItemId ? updateItem : addItem}
                                >
                                    <Icon
                                        name={selectedItemId ? "check" : "plus"}
                                        size={16}
                                        color={theme.colors.onPrimary}
                                    />
                                    <Typography style={styles.addButtonText}>
                                        {selectedItemId ? 'Save' : 'Add Item'}
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addItemButton}
                            onPress={() => setShowAddItem(true)}
                        >
                            <Icon
                                name="plus"
                                size={20}
                                color={theme.colors.textPrimary}
                            />
                            <Typography style={styles.addItemButtonText}>
                                Add Loop Item
                            </Typography>
                        </TouchableOpacity>
                    )}

                    <Typography style={styles.createdText}>
                        Created: {new Date(loop.createdAt).toLocaleDateString()}
                        {loop.createdAt !== loop.updatedAt
                            ? ` • Updated: ${new Date(loop.updatedAt).toLocaleDateString()}`
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