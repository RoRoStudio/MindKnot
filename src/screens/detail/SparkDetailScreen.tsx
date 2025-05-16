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
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spark } from '../../types/spark';
import { useSparks } from '../../hooks/useSparks';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { Typography } from '../../components/common/Typography';
import { useCategories } from '../../hooks/useCategories';
import { getSparkById } from '../../services/sparkService';
import { RootStackParamList } from '../../types/navigation-types';

// Route params type
type SparkDetailRouteProp = RouteProp<
    {
        SparkDetail: {
            sparkId: string;
        };
    },
    'SparkDetail'
>;

type SparkDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SparkDetailScreen() {
    const route = useRoute<SparkDetailRouteProp>();
    const navigation = useNavigation<SparkDetailScreenNavigationProp>();
    const { theme } = useTheme();
    const { sparks, loadSparks, editSpark, removeSpark } = useSparks();
    const { categories } = useCategories();

    const [spark, setSpark] = useState<Spark | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isSaving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isInspired, setIsInspired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const titleInputRef = useRef<TextInput>(null);
    const bodyInputRef = useRef<TextInput>(null);

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
        sparkIcon: {
            alignSelf: 'center',
            marginVertical: theme.spacing.m,
        },
        titleInput: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            padding: 0,
            marginBottom: theme.spacing.m,
            textAlign: 'center',
        },
        bodyInput: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            padding: 0,
            textAlignVertical: 'top',
            minHeight: 150,
        },
        inspirationContainer: {
            marginTop: theme.spacing.l,
            backgroundColor: `${theme.colors.primary}10`,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        inspirationTitle: {
            color: theme.colors.primary,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.s,
        },
        inspirationText: {
            fontStyle: 'italic',
            color: theme.colors.textPrimary,
        },
        inspireMeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginTop: theme.spacing.l,
        },
        inspireMeButtonText: {
            color: theme.colors.onPrimary,
            fontWeight: theme.typography.fontWeight.bold,
            marginLeft: theme.spacing.s,
        },
        metadataSection: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.m,
            justifyContent: 'center',
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
            textAlign: 'center',
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
        divider: {
            height: 1,
            backgroundColor: theme.colors.divider,
            marginVertical: theme.spacing.m,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.s,
            marginTop: theme.spacing.l,
        },
    }));

    // Load the spark from the ID passed in route params
    useEffect(() => {
        const fetchSpark = async () => {
            try {
                setIsLoading(true);
                const { sparkId } = route.params;

                // First try to find the spark in the already loaded sparks
                let foundSpark = sparks.find(s => s.id === sparkId);

                // If not found, try to fetch directly from the database
                if (!foundSpark) {
                    console.log(`Spark not found in state, fetching with ID: ${sparkId}`);
                    const dbSpark = await getSparkById(sparkId);

                    if (dbSpark) {
                        foundSpark = dbSpark;
                    }

                    // Also reload all sparks for consistency
                    loadSparks();
                }

                if (foundSpark) {
                    console.log(`Spark found: ${foundSpark.title}`);
                    setSpark(foundSpark);
                    setTitle(foundSpark.title);
                    setBody(foundSpark.body || '');
                } else {
                    console.log(`Spark with ID ${sparkId} not found even in database`);
                    Alert.alert('Error', 'Spark not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error loading spark:', error);
                Alert.alert('Error', 'Failed to load spark');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpark();
    }, [route.params, sparks, navigation, loadSparks]);

    // Track changes
    useEffect(() => {
        if (!spark) return;

        const titleChanged = title !== spark.title;
        const bodyChanged = body !== (spark.body || '');

        setHasChanges(titleChanged || bodyChanged);
    }, [title, body, spark]);

    // Generate inspiration
    const generateInspiration = useCallback(() => {
        setIsInspired(false);
        // Simulate loading
        setTimeout(() => {
            // Normally this would come from an AI service
            const inspirations = [
                "What if you approached this from an entirely different angle?",
                "Consider how this spark could connect to other areas of your life.",
                "How might someone from a different field or culture view this idea?",
                "What would happen if you combined this with an opposite concept?",
                "Try describing your spark in exactly seven words.",
                "What metaphor best captures the essence of this idea?",
                "Imagine explaining this concept to a child. What would you focus on?"
            ];
            const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
            setIsInspired(randomInspiration === 'true');
        }, 1000);
    }, []);

    // Handle save button press
    const handleSave = useCallback(async () => {
        if (!spark || !hasChanges) return;

        try {
            setSaving(true);

            const updates = {
                title,
                body: body.trim() !== '' ? body : undefined,
            };

            const success = await editSpark(spark.id, updates);

            if (success) {
                setHasChanges(false);
                // Hide keyboard after saving
                Keyboard.dismiss();
            } else {
                Alert.alert('Error', 'Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving spark:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    }, [spark, title, body, hasChanges, editSpark]);

    // Handle back button press
    const handleBack = useCallback(() => {
        if (hasChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Save before leaving?',
                [
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => navigation.goBack(),
                    },
                    {
                        text: 'Save',
                        onPress: async () => {
                            await handleSave();
                            navigation.goBack();
                        },
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    }, [hasChanges, navigation, handleSave]);

    // Handle delete spark
    const handleDeleteSpark = useCallback(() => {
        if (!spark) return;

        Alert.alert(
            'Delete Spark',
            'Are you sure you want to delete this spark? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await removeSpark(spark.id);
                            if (success) {
                                navigation.goBack();
                            } else {
                                Alert.alert('Error', 'Failed to delete spark');
                            }
                        } catch (error) {
                            console.error('Error deleting spark:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        }
                    },
                },
            ]
        );
    }, [spark, removeSpark, navigation]);

    // Toggle options menu
    const toggleOptions = useCallback(() => {
        setShowOptions(prev => !prev);
    }, []);

    // Format date for display
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    // Get category for the spark
    const getCategory = useCallback(() => {
        if (!spark?.categoryId) return null;
        return categories.find(c => c.id === spark.categoryId) || null;
    }, [spark, categories]);

    const category = getCategory();

    if (!spark) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Typography variant="h4" style={styles.headerTitle}>
                        {isLoading ? "Loading..." : "Spark not found"}
                    </Typography>
                </View>
                
                {isLoading && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Typography style={{ marginTop: 16 }}>Loading spark...</Typography>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Typography variant="h4" style={styles.headerTitle}>{hasChanges ? 'Editing' : 'Spark'}</Typography>
                <TouchableOpacity onPress={toggleOptions} style={styles.optionsButton}>
                    <Icon name="ellipsis-vertical" width={24} height={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Options Menu */}
            {showOptions && (
                <>
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={toggleOptions}
                    />
                    <View style={styles.optionsMenu}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                // Add tag functionality here
                                Alert.alert('Coming Soon', 'Tag management will be available soon!');
                            }}
                        >
                            <Icon name="tag" width={20} height={20} color={theme.colors.textPrimary} />
                            <Typography style={styles.optionText}>Manage Tags</Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                // Add category functionality here
                                Alert.alert('Coming Soon', 'Category selection will be available soon!');
                            }}
                        >
                            <Icon name="list" width={20} height={20} color={theme.colors.textPrimary} />
                            <Typography style={styles.optionText}>Change Category</Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                // Turn spark into a note or action
                                Alert.alert('Coming Soon', 'Converting sparks to other entry types will be available soon!');
                            }}
                        >
                            <Icon name="git-branch" width={20} height={20} color={theme.colors.textPrimary} />
                            <Typography style={styles.optionText}>Convert Spark</Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                handleDeleteSpark();
                            }}
                        >
                            <Icon name="trash" width={20} height={20} color={theme.colors.error} />
                            <Typography style={[styles.optionText, { color: theme.colors.error }]}>Delete Spark</Typography>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Main Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Spark Icon */}
                    <Icon
                        name="sparkles"
                        width={48}
                        height={48}
                        color={theme.colors.primary}
                        style={styles.sparkIcon}
                    />

                    {/* Title Input */}
                    <TextInput
                        ref={titleInputRef}
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="What's your spark?"
                        placeholderTextColor={theme.colors.textSecondary}
                        selectionColor={theme.colors.primary}
                        multiline={false}
                        returnKeyType="next"
                        blurOnSubmit={true}
                        onSubmitEditing={() => bodyInputRef.current?.focus()}
                    />

                    {/* Tags & Category */}
                    <View style={styles.metadataSection}>
                        {category && (
                            <View style={[
                                styles.category,
                                {
                                    backgroundColor: `${category.color}20`,
                                    borderColor: category.color,
                                    borderWidth: 1
                                }
                            ]}>
                                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                                <Typography style={styles.categoryText}>{category.title}</Typography>
                            </View>
                        )}

                        {spark.tags && spark.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Typography style={styles.tagText}>#{tag}</Typography>
                            </View>
                        ))}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Body Input */}
                    <Typography style={styles.sectionTitle}>Explore Your Idea</Typography>
                    <TextInput
                        ref={bodyInputRef}
                        style={styles.bodyInput}
                        value={body}
                        onChangeText={setBody}
                        placeholder="Develop your spark here... What's exciting about this idea? What problems might it solve?"
                        placeholderTextColor={theme.colors.textSecondary}
                        selectionColor={theme.colors.primary}
                        multiline={true}
                        autoCapitalize="sentences"
                        textAlignVertical="top"
                    />

                    {/* Inspire Me Button */}
                    <TouchableOpacity
                        style={styles.inspireMeButton}
                        onPress={generateInspiration}
                    >
                        <Icon name="lightbulb" width={20} height={20} color={theme.colors.onPrimary} />
                        <Typography style={styles.inspireMeButtonText}>
                            Inspire Me
                        </Typography>
                    </TouchableOpacity>

                    {/* Inspiration Section */}
                    {isInspired !== false && (
                        <View style={styles.inspirationContainer}>
                            <Typography style={styles.inspirationTitle}>
                                Reflection Prompt
                            </Typography>

                            {typeof isInspired === 'string' ? (
                                <Typography style={styles.inspirationText}>
                                    {isInspired}
                                </Typography>
                            ) : (
                                <ActivityIndicator color={theme.colors.primary} />
                            )}
                        </View>
                    )}

                    {/* Created date */}
                    <Typography style={styles.createdText}>
                        Created: {formatDate(spark.createdAt)}
                    </Typography>

                    {/* Add some padding at the bottom to ensure content isn't hidden behind the save button */}
                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            {hasChanges && (
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (isSaving || !hasChanges) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={isSaving || !hasChanges}
                >
                    <Icon
                        name="check"
                        width={24}
                        height={24}
                        color={theme.colors.onPrimary}
                    />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
} 