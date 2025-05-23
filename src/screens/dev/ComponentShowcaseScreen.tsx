import React, { useState, useCallback } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Switch,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Typography, Icon, IconName, Button, Card, ColorPicker,
    BottomSheet, FormModal, FormSheet, IconPicker
} from '../../components/common';
import { LabelRow } from '../../components/shared';
import { NoteCard, SparkCard, ActionCard, PathCard, LoopCard } from '../../components/entries';
import { useForm, Controller } from 'react-hook-form';
import { BottomSheetConfigProvider } from '../../contexts/BottomSheetConfig';
import { cleanupTestCategories } from '../../api/categoryService';
import { refreshAllCategoryInstances } from '../../hooks/useCategories';
import CategoryManager from '../../components/shared/CategoryManager';

// Form components
import FormInput from '../../components/form/FormInput';
import FormSwitch from '../../components/form/FormSwitch';
import FormCheckbox from '../../components/form/FormCheckbox';
import FormTextarea from '../../components/form/FormTextarea';
import FormRichTextarea from '../../components/form/FormRichTextarea';
import FormSelect from '../../components/form/FormSelect';
import FormRadioGroup from '../../components/form/FormRadioGroup';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormErrorMessage from '../../components/form/FormErrorMessage';
import FormLabelInput from '../../components/form/FormLabelInput';
import FormMoodSelector from '../../components/form/FormMoodSelector';
import FormCategorySelector from '../../components/form/FormCategorySelector';
import FormArrayField from '../../components/form/FormArrayField';
import Form from '../../components/form/Form';

// Mock data for component showcase
const mockData = {
    note: {
        id: 'note-1',
        title: 'Sample Note',
        content: 'This is a sample note content for showcasing the Note component.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['sample', 'showcase'],
    },
    spark: {
        id: 'spark-1',
        title: 'Brilliant Idea',
        description: 'A sample brilliant idea description for showcasing the Spark component.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    action: {
        id: 'action-1',
        title: 'Complete Task',
        description: 'A sample action item for showcasing the Action component.',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['urgent', 'work', 'development', 'testing', 'frontend', 'backend', 'review', 'design'],
    },
    path: {
        id: 'path-1',
        title: 'Learning Path',
        description: 'A sample learning path for showcasing the Path component.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    loop: {
        id: 'loop-1',
        title: 'Daily Routine',
        description: 'A sample loop for showcasing the Loop component.',
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
};

// Form options for select and radio components
const priorityOptions = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

const categoryOptions = [
    { label: 'Work', value: 'work' },
    { label: 'Personal', value: 'personal' },
    { label: 'Health', value: 'health' },
    { label: 'Finance', value: 'finance' },
];

// Showcase section component
const ShowcaseSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const { theme } = useTheme();
    return (
        <View style={{ marginBottom: theme.spacing.l }}>
            <Typography variant="h2" style={{ marginBottom: theme.spacing.m }}>{title}</Typography>
            {children}
        </View>
    );
};

// Create a wrapper component that includes the BottomSheetConfigProvider
const ShowcaseFormSheet: React.FC<React.ComponentProps<typeof FormSheet>> = (props) => {
    return (
        <BottomSheetConfigProvider>
            <FormSheet {...props} />
        </BottomSheetConfigProvider>
    );
};

export default function ComponentShowcaseScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();
    const [selectedColor, setSelectedColor] = useState('#4A90E2');
    const [selectedIcon, setSelectedIcon] = useState<IconName>('lightbulb');
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formSheetVisible, setFormSheetVisible] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Form setup for form components demonstration
    const { control } = useForm({
        defaultValues: {
            textInput: 'Sample text input',
            textarea: 'This is a sample text area with multiple lines of content to demonstrate how the component handles longer text.',
            richTextarea: 'This is a <b>rich</b> text area with <i>formatting</i>.',
            switch: true,
            checkbox: false,
            select: 'medium',
            radio: 'personal',
            date: new Date(),
            password: 'password123',
            tags: ['react', 'native', 'typescript'],
            mood: 4,
            category: null,
            arrayField: [{ id: '1', value: 'First item' }, { id: '2', value: 'Second item' }],
        }
    });

    // Sample icons for showcase - fixed duplicate 'settings' key
    const sampleIcons: IconName[] = [
        'file-text', 'lightbulb', 'check', 'compass', 'calendar-sync',
        'house', 'settings', 'pencil', 'plus', 'trash', 'search'
    ];

    // Sample button variants
    const buttonVariants = ['primary', 'secondary', 'text'];

    // Helper for ArrayField demo
    const renderArrayItem = useCallback((item: any, index: number, remove: (index: number) => void) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 10, borderRadius: 8 }}>
                <Typography style={{ flex: 1 }}>{item.value}</Typography>
                <TouchableOpacity onPress={() => remove(index)}>
                    <Icon name="trash" width={20} height={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        );
    }, [theme]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background
        },
        content: {
            padding: theme.spacing.m
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.l,
            paddingTop: theme.spacing.m,
        },
        backButton: {
            marginRight: theme.spacing.m
        },
        sectionTitle: {
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.s
        },
        card: {
            marginBottom: theme.spacing.m,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
            backgroundColor: theme.colors.background,
        },
        row: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -theme.spacing.xs,
        },
        iconContainer: {
            width: 80,
            height: 80,
            justifyContent: 'center',
            alignItems: 'center',
            margin: theme.spacing.xs,
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.s,
        },
        buttonContainer: {
            marginRight: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        colorBlock: {
            width: 100,
            height: 100,
            margin: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            justifyContent: 'center',
            alignItems: 'center',
        },
        colorName: {
            color: '#fff',
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
        },
        formContainer: {
            marginBottom: theme.spacing.l,
        },
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.divider,
            marginVertical: theme.spacing.m,
        },
        demoButtonRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.m,
        },
        demoButton: {
            margin: theme.spacing.s,
        },
        modalContent: {
            padding: theme.spacing.m,
        },
        bottomSheetFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        categoryManagerButton: {
            marginBottom: theme.spacing.m,
        },
    });

    const handleCleanupTestCategories = async () => {
        try {
            const result = await cleanupTestCategories();
            if (result.errors.length > 0) {
                Alert.alert(
                    'Cleanup Complete',
                    `Deleted ${result.deleted} test categories.\n\nSkipped: ${result.errors.length} categories\n\n${result.errors.join('\n')}`
                );
            } else {
                Alert.alert('Success', `Deleted ${result.deleted} test categories`);
            }
        } catch (error) {
            console.error('Cleanup error:', error);
            Alert.alert('Error', 'Failed to clean up test categories');
        }
    };

    if (showCategoryManager) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle={isDark ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.colors.background}
                />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setShowCategoryManager(false)}
                    >
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Typography variant="h1">Category Management</Typography>
                </View>
                <CategoryManager onCategoryUpdated={() => {
                    // Refresh all category selectors across the app
                    refreshAllCategoryInstances();
                }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Typography variant="h1">Component Showcase</Typography>
            </View>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Core Components Section */}
                <ShowcaseSection title="Core Components">
                    {/* Typography showcase */}
                    <ShowcaseSection title="Typography">
                        <Typography variant="h1">Heading 1</Typography>
                        <Typography variant="h2">Heading 2</Typography>
                        <Typography variant="h3">Heading 3</Typography>
                        <Typography variant="body1">Body 1 - Main text style for content</Typography>
                        <Typography variant="body2">Body 2 - Secondary text style</Typography>
                        <Typography variant="caption">Caption - Small text for additional info</Typography>
                        <Typography variant="button">Button - Text style for buttons</Typography>
                    </ShowcaseSection>

                    {/* Icons showcase */}
                    <ShowcaseSection title="Icons">
                        <View style={styles.row}>
                            {sampleIcons.map((iconName) => (
                                <View key={iconName} style={styles.iconContainer}>
                                    <Icon name={iconName} width={32} height={32} color={theme.colors.textPrimary} />
                                    <Typography variant="caption" style={{ marginTop: theme.spacing.xs }}>
                                        {iconName}
                                    </Typography>
                                </View>
                            ))}
                        </View>
                    </ShowcaseSection>

                    {/* Buttons showcase */}
                    <ShowcaseSection title="Buttons">
                        <View style={styles.row}>
                            {buttonVariants.map((variant) => (
                                <View key={variant} style={styles.buttonContainer}>
                                    <Button
                                        label={variant}
                                        variant={variant as any}
                                        onPress={() => { }}
                                    />
                                </View>
                            ))}
                        </View>
                        <View style={styles.row}>
                            {/* <View style={styles.buttonContainer}>
                                <Button
                                    label="With Icon"
                                    variant="primary"
                                    onPress={() => { }}
                                    leftIcon="plus"
                                />
                            </View> */}
                            <View style={styles.buttonContainer}>
                                <Button
                                    label="Disabled"
                                    variant="primary"
                                    onPress={() => { }}
                                    disabled
                                />
                            </View>
                            <View style={styles.buttonContainer}>
                                <Button
                                    label="Loading"
                                    variant="primary"
                                    onPress={() => { }}
                                    isLoading
                                />
                            </View>
                        </View>
                    </ShowcaseSection>

                    {/* Cards showcase */}
                    <ShowcaseSection title="Cards">
                        <Card style={{ marginBottom: theme.spacing.m }}>
                            <Typography variant="h3" style={{ marginBottom: theme.spacing.s }}>Basic Card</Typography>
                            <Typography variant="body1">This is a basic card component with simple content.</Typography>
                        </Card>

                        <Card style={{ marginBottom: theme.spacing.m }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.s }}>
                                <Icon name="circle-help" width={24} height={24} color={theme.colors.primary} style={{ marginRight: theme.spacing.s }} />
                                <Typography variant="h3">Card with Icon</Typography>
                            </View>
                            <Typography variant="body1">This is a card with an icon in the header.</Typography>
                            <Button
                                label="Card Action"
                                variant="outline"
                                onPress={() => { }}
                                style={{ alignSelf: 'flex-end', marginTop: theme.spacing.s }}
                            />
                        </Card>

                        <Card
                            onPress={() => alert('Card pressed')}
                            title="Interactive Card"
                            style={{ marginBottom: theme.spacing.m }}
                        >
                            <Typography variant="body1">This card is touchable. Try tapping it!</Typography>
                        </Card>

                        <Card elevated style={{ marginBottom: theme.spacing.m }}>
                            <Typography variant="h3" style={{ marginBottom: theme.spacing.s }}>Elevated Card</Typography>
                            <Typography variant="body1">This card has elevation for a shadow effect.</Typography>
                        </Card>
                    </ShowcaseSection>

                    {/* Colors showcase */}
                    <ShowcaseSection title="Theme Colors">
                        <View style={styles.row}>
                            {Object.entries(theme.colors).map(([name, color]) =>
                                typeof color === 'string' && (
                                    <View key={name} style={[styles.colorBlock, { backgroundColor: color }]}>
                                        <Typography variant="caption" style={styles.colorName}>{name}</Typography>
                                    </View>
                                )
                            )}
                        </View>
                    </ShowcaseSection>
                </ShowcaseSection>

                {/* Basic Input Components */}
                <ShowcaseSection title="Basic Input Components">
                    <Form style={styles.formContainer}>
                        {/* Text Input */}
                        <FormInput
                            name="textInput"
                            control={control}
                            label="Text Input"
                            placeholder="Enter text here"
                            helperText="This is a standard text input field"
                        />

                        {/* Password Input */}
                        <FormInput
                            name="password"
                            control={control}
                            label="Password Input"
                            placeholder="Enter password"
                            secureTextEntry
                            helperText="This is a password input with show/hide toggle"
                        />

                        {/* Text Area */}
                        <FormTextarea
                            name="textarea"
                            control={control}
                            label="Text Area"
                            placeholder="Enter multi-line text here"
                            helperText="This is a text area for longer content"
                            maxLength={200}
                            showCharCount
                        />

                        {/* Error Message */}
                        <FormErrorMessage
                            message="This is how an error message would appear"
                            visible={true}
                        />
                    </Form>
                </ShowcaseSection>

                {/* Selection Components */}
                <ShowcaseSection title="Selection Components">
                    <Form style={styles.formContainer}>
                        {/* Switch */}
                        <FormSwitch
                            name="switch"
                            control={control}
                            label="Switch Component"
                            helperText="Toggle this switch on/off"
                        />

                        {/* Checkbox */}
                        <FormCheckbox
                            name="checkbox"
                            control={control}
                            label="Checkbox Component"
                            helperText="Check this box to agree to terms"
                        />

                        {/* Select Dropdown */}
                        <FormSelect
                            name="select"
                            control={control}
                            label="Select Component"
                            options={priorityOptions}
                            helperText="Select a priority level"
                        />

                        {/* Radio Group */}
                        <FormRadioGroup
                            name="radio"
                            control={control}
                            label="Radio Group Component"
                            options={categoryOptions}
                            helperText="Select a category"
                        />

                        {/* Date Picker */}
                        <FormDatePicker
                            name="date"
                            control={control}
                            label="Date Picker Component"
                            helperText="Select a date"
                        />
                    </Form>
                </ShowcaseSection>

                {/* Advanced Input Components */}
                <ShowcaseSection title="Advanced Input Components">
                    {/* Color Picker showcase */}
                    <ShowcaseSection title="Color Picker">
                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s }}>
                            Selected color: {selectedColor}
                        </Typography>
                        <ColorPicker
                            selectedColor={selectedColor}
                            onColorSelected={setSelectedColor}
                        />
                    </ShowcaseSection>

                    {/* Icon Picker */}
                    <ShowcaseSection title="Icon Picker">
                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s }}>
                            Selected icon: {selectedIcon}
                        </Typography>
                        <IconPicker
                            selectedIcon={selectedIcon}
                            onSelectIcon={setSelectedIcon}
                        />
                    </ShowcaseSection>

                    {/* Form Rich Text Editor */}
                    <ShowcaseSection title="Rich Text Editor">
                        <Form style={styles.formContainer}>
                            <View style={{ flex: 1, minHeight: 200 }}>
                                <FormRichTextarea
                                    name="richTextarea"
                                    control={control}
                                    label="Rich Text Editor"
                                    placeholder="Enter formatted text here..."
                                    helperText="This editor supports rich text formatting with controls"
                                    showCharCount
                                    maxLength={500}
                                    minimumHeight={150}
                                />
                            </View>
                        </Form>
                    </ShowcaseSection>

                    {/* Form Tag Input */}
                    <Form style={styles.formContainer}>
                        <FormLabelInput
                            name="tags"
                            control={control}
                            label="Tag Input"
                            helperText="Add tags by typing and pressing enter or the plus button"
                        />
                    </Form>

                    {/* Form Mood Selector */}
                    <Form style={styles.formContainer}>
                        <FormMoodSelector
                            name="mood"
                            control={control}
                            label="Mood Selector"
                            helperText="Select your current mood"
                        />
                    </Form>

                    {/* Form Array Field */}
                    <Form style={styles.formContainer}>
                        <FormArrayField
                            name="arrayField"
                            control={control}
                            label="Array Field"
                            renderItem={renderArrayItem}
                            addButtonLabel="Add Item"
                            defaultItem={{ id: Date.now().toString(), value: "New item" }}
                            helperText="Add, remove, and manage list items"
                        />
                    </Form>

                    {/* Form Category Selector */}
                    <Form style={styles.formContainer}>
                        <FormCategorySelector
                            name="category"
                            control={control}
                            label="Category Selector"
                            helperText="Select or create a category"
                        />
                    </Form>
                </ShowcaseSection>

                {/* Label Row Components */}
                <ShowcaseSection title="Label Row Components">
                    <ShowcaseSection title="Label Row - Basic">
                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s }}>
                            Few labels (no overflow):
                        </Typography>
                        <LabelRow labels={['React', 'TypeScript']} />
                    </ShowcaseSection>

                    <ShowcaseSection title="Label Row - With Overflow">
                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s }}>
                            Many labels (with overflow indicator):
                        </Typography>
                        <LabelRow
                            labels={['JavaScript', 'TypeScript', 'React', 'React Native', 'Node.js', 'Express', 'MongoDB', 'GraphQL', 'Apollo', 'Expo']}
                            maxLabelsToShow={3}
                        />
                    </ShowcaseSection>

                    <ShowcaseSection title="Label Row - Different Sizes">
                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s }}>
                            Small size:
                        </Typography>
                        <LabelRow
                            labels={['Small', 'Size', 'Labels', 'With', 'Overflow', 'Test']}
                            size="small"
                            maxLabelsToShow={4}
                        />

                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s, marginTop: theme.spacing.m }}>
                            Large size:
                        </Typography>
                        <LabelRow
                            labels={['Large', 'Size', 'Labels', 'Example']}
                            size="large"
                            maxLabelsToShow={2}
                        />
                    </ShowcaseSection>

                    <ShowcaseSection title="Label Row - Custom Gap">
                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s }}>
                            Tight spacing (gap: 4):
                        </Typography>
                        <LabelRow
                            labels={['Tight', 'Spacing', 'Example', 'Labels', 'Here']}
                            gap={4}
                            maxLabelsToShow={3}
                        />

                        <Typography variant="body2" style={{ marginBottom: theme.spacing.s, marginTop: theme.spacing.m }}>
                            Wide spacing (gap: 12):
                        </Typography>
                        <LabelRow
                            labels={['Wide', 'Spacing', 'Example', 'More', 'Space']}
                            gap={12}
                            maxLabelsToShow={3}
                        />
                    </ShowcaseSection>
                </ShowcaseSection>

                {/* Container Components */}
                <ShowcaseSection title="Container Components">
                    <View style={styles.demoButtonRow}>
                        <Button
                            label="Show Bottom Sheet"
                            variant="primary"
                            onPress={() => setBottomSheetVisible(true)}
                            style={styles.demoButton}
                        />
                        <Button
                            label="Show Modal"
                            variant="primary"
                            onPress={() => setModalVisible(true)}
                            style={styles.demoButton}
                        />
                        <Button
                            label="Show Form Sheet"
                            variant="primary"
                            onPress={() => setFormSheetVisible(true)}
                            style={styles.demoButton}
                        />
                    </View>

                    {/* Bottom Sheet (will render when visible) */}
                    <BottomSheet
                        visible={bottomSheetVisible}
                        onClose={() => setBottomSheetVisible(false)}
                        showDragIndicator={true}
                        footerContent={
                            <View style={styles.bottomSheetFooter}>
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onPress={() => setBottomSheetVisible(false)}
                                />
                                <Button
                                    label="Confirm"
                                    variant="primary"
                                    onPress={() => setBottomSheetVisible(false)}
                                />
                            </View>
                        }
                    >
                        <View style={styles.modalContent}>
                            <Typography variant="h3" style={{ marginBottom: theme.spacing.m }}>Bottom Sheet</Typography>
                            <Typography variant="body1">This is a bottom sheet component that slides up from the bottom of the screen.</Typography>
                            <Typography variant="body1" style={{ marginTop: theme.spacing.m }}>It's ideal for additional actions or information without leaving the current screen.</Typography>
                        </View>
                    </BottomSheet>

                    {/* Form Modal */}
                    <FormModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title="Form Modal"
                        onSubmit={() => setModalVisible(false)}
                        submitLabel="Save"
                    >
                        <View style={styles.modalContent}>
                            <Typography variant="body1">This is a modal dialog that can contain forms or other content.</Typography>
                            <FormInput
                                name="textInput"
                                control={control}
                                label="Sample Input"
                                placeholder="Enter text here"
                            />
                        </View>
                    </FormModal>

                    {/* Form Sheet - Use the wrapped component instead */}
                    <ShowcaseFormSheet
                        visible={formSheetVisible}
                        onClose={() => setFormSheetVisible(false)}
                        title="Form Sheet"
                        onSubmit={() => setFormSheetVisible(false)}
                        submitLabel="Save"
                    >
                        <View style={styles.modalContent}>
                            <Typography variant="body1">This is a form sheet, which is a bottom sheet specialization for forms.</Typography>
                            <FormInput
                                name="textInput"
                                control={control}
                                label="Sample Input"
                                placeholder="Enter text here"
                            />
                        </View>
                    </ShowcaseFormSheet>
                </ShowcaseSection>

                {/* Entry components showcase */}
                <ShowcaseSection title="Entry Components">
                    <NoteCard note={mockData.note as any} onPress={() => { }} />
                    <SparkCard spark={mockData.spark as any} onPress={() => { }} />
                    <ActionCard action={mockData.action as any} onPress={() => { }} />
                    <PathCard path={mockData.path as any} onPress={() => { }} />
                    <LoopCard loop={mockData.loop as any} onPress={() => { }} />
                </ShowcaseSection>

                <ShowcaseSection title="Database Utilities">
                    <Button
                        label="Manage Categories"
                        onPress={() => setShowCategoryManager(true)}
                        variant="primary"
                        style={styles.categoryManagerButton}
                    />
                    <Button
                        label="Clean Up Test Categories"
                        onPress={handleCleanupTestCategories}
                        variant="danger"
                    />
                </ShowcaseSection>
            </ScrollView>
        </SafeAreaView>
    );
} 