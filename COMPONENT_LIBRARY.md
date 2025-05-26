# MindKnot Component Library Documentation

*Auto-generated on 2025-05-26T19:28:33.365Z*

This document provides comprehensive documentation of all shared components in the MindKnot app. Always reference this when implementing UI to ensure consistency.

## Quick Reference

| Component | Category | Description |
|-----------|----------|-------------|
| [BaseEntityScreen](#baseentityscreen) | Layout Components | Base props for entity data |
| [BeautifulTimer](#beautifultimer) | Specialized Components | BeautifulTimer component |
| [BottomSheet](#bottomsheet) | Layout Components | Props for the BottomSheet component |
| [Button](#button) | Core UI | Button component for user interactions |
| [Card](#card) | Core UI | Props for the Card component |
| [CategoryManager](#categorymanager) | Other | CategoryManager component |
| [CategoryPill](#categorypill) | Specialized Components | Props for the CategoryPill component |
| [ColorPicker](#colorpicker) | Other | Predefined colors for the color picker |
| [ConfirmationModal](#confirmationmodal) | Layout Components | Whether the modal is visible |
| [CustomBottomNavBar](#custombottomnavbar) | Specialized Components | CustomBottomNavBar component |
| [DiamondFab](#diamondfab) | Specialized Components | DiamondFab component |
| [DottedPillButton](#dottedpillbutton) | Other | Label text to display |
| [EntryCard](#entrycard) | Specialized Components | EntryCard component |
| [EntryDetailHeader](#entrydetailheader) | Specialized Components | Props for the EntryDetailHeader component |
| [EntryMetadataBar](#entrymetadatabar) | Other | The ID of the category currently selected |
| [EntryTitleInput](#entrytitleinput) | Other | React Hook Form control object |
| [ExpandableLoopHeader](#expandableloopheader) | Other | ExpandableLoopHeader component |
| [FilterableList](#filterablelist) | Layout Components | Props for the FilterableList component |
| [FilterableListHeader](#filterablelistheader) | Other | Category object structure |
| [Form](#form) | Other | Form component |
| [FormArrayField](#formarrayfield) | Other | FormArrayField component |
| [FormCategorySelector](#formcategoryselector) | Form Components | FormCategorySelector component |
| [FormCheckbox](#formcheckbox) | Form Components | FormCheckbox component for boolean input |
| [FormDatePicker](#formdatepicker) | Form Components | FormDatePicker component |
| [FormErrorMessage](#formerrormessage) | Other | FormErrorMessage component |
| [FormInput](#forminput) | Form Components | Whether this input is used as a title field |
| [FormLabelInput](#formlabelinput) | Other | FormLabelInput component |
| [FormModal](#formmodal) | Layout Components | Props for the FormModal component |
| [FormMoodSelector](#formmoodselector) | Form Components | FormMoodSelector component |
| [FormRadioGroup](#formradiogroup) | Form Components | FormRadioGroup component for selecting a single option from a list of options |
| [FormRichTextarea](#formrichtextarea) | Other | FormRichTextarea component |
| [FormSelect](#formselect) | Form Components | FormSelect component for selecting an option from a dropdown |
| [FormSheet](#formsheet) | Layout Components | Props for the FormSheet component |
| [FormSwitch](#formswitch) | Form Components | FormSwitch component |
| [FormTagInput](#formtaginput) | Form Components | FormTagInput component |
| [FormTextarea](#formtextarea) | Form Components | FormTextarea component |
| [Icon](#icon) | Core UI | Icon component that renders SVG icons from the Lucide icon set |
| [IconPicker](#iconpicker) | Other | Props for the IconPicker component |
| [Label](#label) | Other | Label component for displaying and interacting with labels |
| [LabelRow](#labelrow) | Other | LabelRow component for displaying labels with smart overflow handling |
| [LoopExecutionHeader](#loopexecutionheader) | Other | LoopExecutionHeader component |
| [Typography](#typography) | Core UI | Typography component for consistent text styling throughout the app |

## Component Categories

### Layout Components

#### BaseEntityScreen

**File**: `src/shared/components/BaseEntityScreen.tsx`

**Description**: Base props for entity data

**Props Interface**:
```typescript
/**
     * Array of entity data
     */
    data: T[];

    /**
     * Function to load/refresh data
     */
    loadData: () => Promise<void>;

    /**
     * Function to render each list item
     */
    renderItem: React.ComponentProps<typeof FilterableList>['renderItem'];

    /**
     * Function to create a new entity
     */
    onCreateEntity?: () => void;

    /**
     * Title for the create button
     */
    createButtonLabel?: string;

    /**
     * Icon to display when list is empty
     */
    emptyIcon: IconName;

    /**
     * Text to display when list is empty
     */
    emptyText: string;

    /**
     * Current search term
     */
    searchTerm?: string;

    /**
     * Function to update search term
     */
    onSearchChange?: (text: string) => void;

    /**
     * All available tags for filtering
     */
    allTags?: string[];

    /**
     * Currently selected tags
     */
    selectedTags?: string[];

    /**
     * Function to toggle tag selection
     */
    onToggleTag?: (tag: string) => void;

    /**
     * Current sort order
     */
    sortOrder?: 'newest' | 'oldest' | 'alphabetical';

    /**
     * Function to update sort order
     */
    onSortChange?: (sortOrder: 'newest' | 'oldest' | 'alphabetical') => void;

    /**
     * Category ID for filtering
     */
    categoryId?: string | null;

    /**
     * Function to update category
     */
    onCategoryChange?: (id: string | null) => void;

    /**
     * Whether to show in grid view
     */
    isGridView?: boolean;

    /**
     * Function to toggle grid/list view
     */
    onToggleView?: () => void;

    /**
     * Whether data is currently loading
     */
    isLoading?: boolean;

    /**
     * Extra props to pass to FilterableList
     */
    listProps?: Partial<React.ComponentProps<typeof FilterableList>>;

    /**
     * Header component to render above the list
     */
    ListHeaderComponent?: React.ReactNode;
```

---

#### BottomSheet

**File**: `src/shared/components/BottomSheet.tsx`

**Description**: Props for the BottomSheet component

**Props Interface**:
```typescript
/**
     * Whether the bottom sheet is visible
     */
    visible: boolean;

    /**
     * Function to call when the bottom sheet is closed
     */
    onClose: () => void;

    /**
     * Content to render inside the bottom sheet
     */
    children: React.ReactNode;

    /**
     * Optional content to render in the footer
     */
    footerContent?: React.ReactNode;

    /**
     * Array of snap points as percentages of screen height (0-1)
     * @default [0.9, 0.5]
     */
    snapPoints?: number[];

    /**
     * Whether to show the drag indicator at the top of the sheet
     * @default true
     */
    showDragIndicator?: boolean;

    /**
     * Duration of the open/close animation in milliseconds
     * @default 300
     */
    animationDuration?: number;

    /**
     * Maximum height of the sheet as pixels or percentage (0-1) of screen height
     * @default 0.9 (90% of screen height)
     */
    maxHeight?: number;

    /**
     * Minimum height of the sheet in pixels
     * @default 180
     */
    minHeight?: number;

    /**
     * Whether the sheet can be dismissed by dragging down
     * @default true
     */
    dismissible?: boolean;

    /**
     * Opacity of the backdrop when fully visible
     * @default 0.5
     */
    backdropOpacity?: number;

    /**
     * Height of the footer area in pixels
     * @default 80
     */
    footerHeight?: number;
```

---

#### ConfirmationModal

**File**: `src/shared/components/ConfirmationModal.tsx`

**Description**: Whether the modal is visible

**Props Interface**:
```typescript
/**
     * Whether the modal is visible
     */
    visible: boolean;

    /**
     * Title text for the modal
     */
    title: string;

    /**
     * Main message/description for the modal
     */
    message: string;

    /**
     * Optional icon to display in the modal header
     */
    icon?: IconName;

    /**
     * Color of the icon and primary elements
     * @default theme.colors.primary
     */
    accentColor?: string;

    /**
     * Text for the confirm button
     * @default 'Confirm'
     */
    confirmText?: string;

    /**
     * Text for the cancel button
     * @default 'Cancel'
     */
    cancelText?: string;

    /**
     * Callback when confirm is pressed
     */
    onConfirm: () => void;

    /**
     * Callback when cancel is pressed or modal is dismissed
     */
    onCancel: () => void;

    /**
     * Whether the modal is for a destructive action
     * @default false
     */
    isDestructive?: boolean;
```

---

#### FilterableList

**File**: `src/shared/components/FilterableList.tsx`

**Description**: Props for the FilterableList component

**Props Interface**:
```typescript
/**
     * Array of data items to display in the list
     */
    data: T[];

    /**
     * Function to load/refresh data
     */
    loadData: () => Promise<void>;

    /**
     * The render function for each item
     */
    renderItem: ListRenderItem<T>;

    /**
     * All possible tags for the filter
     */
    allTags?: string[];

    /**
     * Currently selected tags for filtering
     */
    selectedTags?: string[];

    /**
     * Function to toggle a tag selection
     */
    onToggleTag?: (tag: string) => void;

    /**
     * Current search term
     */
    searchTerm?: string;

    /**
     * Function to update search term
     */
    onSearchChange?: (text: string) => void;

    /**
     * Currently selected category ID
     */
    categoryId?: string | null;

    /**
     * Function to update selected category
     */
    onCategoryChange?: (id: string | null) => void;

    /**
     * Current sort order
     */
    sortOrder?: 'newest' | 'oldest' | 'alphabetical';

    /**
     * Function to update sort order
     */
    onSortChange?: (sort: 'newest' | 'oldest' | 'alphabetical') => void;

    /**
     * Icon to display when list is empty
     */
    emptyIcon: IconName;

    /**
     * Text to display when list is empty
     */
    emptyText: string;

    /**
     * Function to extract key for each item
     */
    keyExtractor: (item: T) => string;

    /**
     * Function to filter items based on filters
     */
    filterPredicate?: (item: T, searchTerm: string, selectedTags: string[], categoryId: string | null) => boolean;

    /**
     * Function to sort items
     */
    sortItems?: (a: T, b: T, sortOrder: 'newest' | 'oldest' | 'alphabetical') => number;

    /**
     * Whether to show items in grid vs list view
     */
    isGridView?: boolean;

    /**
     * Function to toggle between grid and list view
     */
    onToggleView?: () => void;

    /**
     * Function to create a new item
     */
    onCreateItem?: () => void;

    /**
     * Header component to render above the list
     */
    ListHeaderComponent?: React.ReactNode;

    /**
     * Whether data is currently loading
     */
    isLoading?: boolean;

    /**
     * Extra props for FlatList
     */
    listProps?: Partial<React.ComponentProps<typeof FlatList>>;

    /**
     * Whether to show the create button
     */
    showCreateButton?: boolean;

    /**
     * Label for create button
     */
    createButtonLabel?: string;

    /**
     * Categories for the filter
     */
    categories?: Category[];
```

---

#### FormModal

**File**: `src/shared/components/FormModal.tsx`

**Description**: Props for the FormModal component

**Props Interface**:
```typescript
/**
     * Whether the modal is visible
     */
    visible: boolean;

    /**
     * Function to call when modal is closed
     */
    onClose: () => void;

    /**
     * Title for the modal header
     */
    title: string;

    /**
     * Form content to display in the modal
     */
    children: React.ReactNode;

    /**
     * Function to call when the form is submitted
     */
    onSubmit?: () => void;

    /**
     * Whether the form is currently submitting
     * @default false
     */
    isSubmitting?: boolean;

    /**
     * Whether this is an edit form (vs create)
     * @default false
     */
    isEdit?: boolean;

    /**
     * Custom label for the submit button
     * @default 'Save'
     */
    submitLabel?: string;
```

---

#### FormSheet

**File**: `src/shared/components/FormSheet.tsx`

**Description**: Props for the FormSheet component

**Props Interface**:
```typescript
/**
     * Whether the form sheet is visible
     */
    visible: boolean;

    /**
     * Function to call when the sheet is closed
     */
    onClose: () => void;

    /**
     * Title for the form header
     */
    title: string;

    /**
     * Form content to display in the sheet
     */
    children: ReactNode;

    /**
     * Function to call when the form is submitted
     */
    onSubmit?: () => void;

    /**
     * Whether the form is currently submitting
     * @default false
     */
    isSubmitting?: boolean;

    /**
     * Custom label for the submit button
     */
    submitLabel?: string;

    /**
     * Whether this is an edit form (vs create)
     * @default false
     */
    isEdit?: boolean;

    /**
     * Additional props to pass to the BottomSheet component
     * @default {
```

---

### Specialized Components

#### BeautifulTimer

**File**: `src/shared/components/BeautifulTimer.tsx`

**Description**: BeautifulTimer component

---

#### CategoryPill

**File**: `src/shared/components/CategoryPill.tsx`

**Description**: Props for the CategoryPill component

**Props Interface**:
```typescript
/**
     * Category title to display inside the pill
     */
    title: string;

    /**
     * Color for the pill's border and background (with opacity)
     */
    color: string;

    /**
     * Optional size variant
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Whether the pill is selectable/toggleable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the pill is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Callback for when the pill is pressed (when selectable)
     */
    onPress?: () => void;

    /**
     * Optional additional styles for the container
     */
    style?: any;
```

---

#### CustomBottomNavBar

**File**: `src/shared/components/CustomBottomNavBar.tsx`

**Description**: CustomBottomNavBar component

---

#### DiamondFab

**File**: `src/shared/components/DiamondFab.tsx`

**Description**: DiamondFab component

---

#### EntryCard

**File**: `src/shared/components/EntryCard.tsx`

**Description**: EntryCard component

---

#### EntryDetailHeader

**File**: `src/shared/components/EntryDetailHeader.tsx`

**Description**: Props for the EntryDetailHeader component

**Props Interface**:
```typescript
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
     * @deprecated Use entryType instead
     */
    title?: string;

    /**
     * The type of entry (Note, Path, Spark, etc.)
     */
    entryType?: string;
```

---

### Core UI

#### Button

**File**: `src/shared/components/Button.tsx`

**Description**: Button component for user interactions

**Available Types/Variants**:
- `ButtonVariant`: 'primary' | 'secondary' | 'text' | 'danger' | 'outline'
- `ButtonSize`: 'small' | 'medium' | 'large' | 'xs'

**Props Interface**:
```typescript
/**
     * The style variant of the button
     * @default 'primary'
     */
    variant?: ButtonVariant;

    /**
     * The text label of the button
     */
    label: string;

    /**
     * Icon to display on the left side of the label
     */
    leftIcon?: IconName;

    /**
     * Icon to display on the right side of the label
     */
    rightIcon?: IconName;

    /**
     * Whether the button should take the full width of its container
     * @default false
     */
    fullWidth?: boolean;

    /**
     * The size variant of the button
     * @default 'medium'
     */
    size?: SizeVariant;

    /**
     * Custom style for the button text
     */
    labelStyle?: StyleProp<TextStyle>;

    /**
     * Custom style for the icon
     */
    iconStyle?: StyleProp<ViewStyle>;
```

**Usage Examples**:
```jsx
// Basic usage
 <Button label="Submit" onPress={handleSubmit} />
 
 // With variant
 <Button label="Cancel" variant="secondary" onPress={handleCancel} />
 
 // With icons
 <Button label="Add Item" leftIcon="plus" onPress={handleAdd} />
 
 // Loading state
 <Button label="Save" isLoading={isSaving} onPress={handleSave} />
 
 // Full width
 <Button label="Login" fullWidth onPress={handleLogin} />
```

---

#### Card

**File**: `src/shared/components/Card.tsx`

**Description**: Props for the Card component

**Props Interface**:
```typescript
/**
     * Optional title to display at the top of the card
     */
    title?: string;

    /**
     * Optional press handler for making the card interactive
     */
    onPress?: () => void;

    /**
     * Content to render inside the card
     */
    children: React.ReactNode;

    /**
     * Whether the card should have elevation styles
     * @default false
     */
    elevated?: boolean;

    /**
     * Whether the card should have padding removed
     * @default false
     */
    noPadding?: boolean;
```

---

#### Icon

**File**: `src/shared/components/Icon.tsx`

**Description**: Icon component that renders SVG icons from the Lucide icon set

**Props Interface**:
```typescript
/**
     * Name of the icon to display
     */
    name: IconName;

    /**
     * Size of the icon (applies to both width and height)
     * If provided, takes precedence over width/height
     */
    size?: number;

    /**
     * Color of the icon
     * Defaults to the current text color
     */
    color?: string;
```

**Usage Examples**:
```jsx
// Basic usage
 <Icon name="plus" size={24} color="#000000" />
 
 // With specific width/height (overrides size)
 <Icon name="arrow-left" width={32} height={20} color="red" />
```

---

#### Typography

**File**: `src/shared/components/Typography.tsx`

**Description**: Typography component for consistent text styling throughout the app

**Available Types/Variants**:
- `TypographyVariant`: | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline' | 'label'
- `TypographyColor`: | 'primary' | 'secondary' | 'disabled' | 'error' | 'success' | 'warning' | 'info' | 'inherit' | string

**Props Interface**:
```typescript
/**
     * The typographic variant to use
     * @default 'body1'
     */
    variant?: TypographyVariant;

    /**
     * The color of the text
     * @default 'inherit'
     */
    color?: TypographyColor;

    /**
     * Text alignment
     * @default 'left'
     */
    align?: TypographyAlign;

    /**
     * Whether the text should be bold
     * @default false
     */
    bold?: boolean;

    /**
     * Whether the text should be italic
     * @default false
     */
    italic?: boolean;

    /**
     * Content to be rendered within the Typography component
     */
    children: React.ReactNode;
```

**Usage Examples**:
```jsx
// Basic usage
 <Typography>Default body text</Typography>
 
 // With variant
 <Typography variant="h1">Heading 1</Typography>
 
 // With custom styling
 <Typography variant="body2" color="primary" bold>Emphasized text</Typography>
 
 // With alignment
 <Typography align="center">Centered text</Typography>
```

---

### Other

#### CategoryManager

**File**: `src/shared/components/CategoryManager.tsx`

**Description**: CategoryManager component

---

#### ColorPicker

**File**: `src/shared/components/ColorPicker.tsx`

**Description**: Predefined colors for the color picker

**Props Interface**:
```typescript
/**
     * Currently selected color (hex format)
     */
    selectedColor: string;

    /**
     * Function to call when a color is selected
     */
    onColorSelected: (color: string) => void;

    /**
     * Optional style for the container
     */
    style?: StyleProp<ViewStyle>;
```

---

#### DottedPillButton

**File**: `src/shared/components/DottedPillButton.tsx`

**Description**: Label text to display

---

#### EntryMetadataBar

**File**: `src/shared/components/EntryMetadataBar.tsx`

**Description**: The ID of the category currently selected

**Props Interface**:
```typescript
/**
     * The ID of the category currently selected
     */
    categoryId: string | null;

    /**
     * Callback when category is changed
     */
    onCategoryChange: (categoryId: string | null) => void;

    /**
     * Array of labels for the entry 
     */
    labels: string[];

    /**
     * Callback when labels are updated
     */
    onLabelsChange: (labels: string[]) => void;

    /**
     * Whether this is in edit mode
     * @default false
     */
    isEditing?: boolean;
```

---

#### EntryTitleInput

**File**: `src/shared/components/EntryTitleInput.tsx`

**Description**: React Hook Form control object

---

#### ExpandableLoopHeader

**File**: `src/shared/components/ExpandableLoopHeader.tsx`

**Description**: ExpandableLoopHeader component

---

#### FilterableListHeader

**File**: `src/shared/components/FilterableListHeader.tsx`

**Description**: Category object structure

**Props Interface**:
```typescript
/**
     * Current search term
     */
    searchTerm: string;

    /**
     * Function to update search term
     */
    onSearchChange: (text: string) => void;

    /**
     * Array of all possible tags for filtering
     */
    allTags: string[];

    /**
     * Currently selected tags
     */
    selectedTags: string[];

    /**
     * Function to toggle tag selection
     */
    onToggleTag: (tag: string) => void;

    /**
     * All available categories
     */
    categories: Category[];

    /**
     * Currently selected category ID
     */
    categoryId: string | null;

    /**
     * Function to update selected category
     */
    onCategoryChange: (id: string | null) => void;

    /**
     * Current sort order
     */
    sortOrder: 'newest' | 'oldest' | 'alphabetical';

    /**
     * Function to update sort order
     */
    onSortChange: (sort: 'newest' | 'oldest' | 'alphabetical') => void;

    /**
     * Function to clear all filters
     */
    onClearFilters: () => void;

    /**
     * Whether to show categories filter
     * @default true
     */
    showCategoriesFilter?: boolean;
```

---

#### Form

**File**: `src/shared/components/Form.tsx`

**Description**: Form component

---

#### FormArrayField

**File**: `src/shared/components/FormArrayField.tsx`

**Description**: FormArrayField component

---

#### FormErrorMessage

**File**: `src/shared/components/FormErrorMessage.tsx`

**Description**: FormErrorMessage component

---

#### FormLabelInput

**File**: `src/shared/components/FormLabelInput.tsx`

**Description**: FormLabelInput component

---

#### FormRichTextarea

**File**: `src/shared/components/FormRichTextarea.tsx`

**Description**: FormRichTextarea component

---

#### IconPicker

**File**: `src/shared/components/IconPicker.tsx`

**Description**: Props for the IconPicker component

**Props Interface**:
```typescript
/**
     * Currently selected icon
     */
    selectedIcon: IconName | null;

    /**
     * Function to call when an icon is selected
     */
    onSelectIcon: (icon: IconName) => void;
```

---

#### Label

**File**: `src/shared/components/Label.tsx`

**Description**: Label component for displaying and interacting with labels

**Available Types/Variants**:
- `LabelSize`: 'small' | 'medium' | 'large'

**Props Interface**:
```typescript
/**
     * Label text to display
     */
    label: string;

    /**
     * Size variant of the label
     * @default 'medium'
     */
    size?: LabelSize;

    /**
     * Whether the label is selectable/toggleable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the label is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Callback for when the label is pressed (when selectable)
     */
    onPress?: () => void;

    /**
     * Whether to show a remove/close icon
     * @default false
     */
    removable?: boolean;

    /**
     * Callback for when the remove icon is pressed
     */
    onRemove?: () => void;

    /**
     * Optional additional styles for the container
     */
    style?: StyleProp<ViewStyle>;
```

---

#### LabelRow

**File**: `src/shared/components/LabelRow.tsx`

**Description**: LabelRow component for displaying labels with smart overflow handling

**Props Interface**:
```typescript
/**
     * Array of label strings to display
     */
    labels: string[];

    /**
     * Maximum number of labels to show before showing overflow indicator
     * @default 3
     */
    maxLabelsToShow?: number;

    /**
     * Size variant for all labels
     * @default 'medium'
     */
    size?: LabelProps['size'];

    /**
     * Whether labels are selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether labels are removable
     * @default false
     */
    removable?: boolean;

    /**
     * Callback for when a label is pressed (when selectable)
     */
    onLabelPress?: (label: string, index: number) => void;

    /**
     * Callback for when a label remove is pressed (when removable)
     */
    onLabelRemove?: (label: string, index: number) => void;

    /**
     * Custom gap between labels
     * @default 8
     */
    gap?: number;

    /**
     * Optional additional styles for the container
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Optional style for individual labels
     */
    labelStyle?: StyleProp<ViewStyle>;
```

---

#### LoopExecutionHeader

**File**: `src/shared/components/LoopExecutionHeader.tsx`

**Description**: LoopExecutionHeader component

---

### Form Components

#### FormCategorySelector

**File**: `src/shared/components/FormCategorySelector.tsx`

**Description**: FormCategorySelector component

---

#### FormCheckbox

**File**: `src/shared/components/FormCheckbox.tsx`

**Description**: FormCheckbox component for boolean input

---

#### FormDatePicker

**File**: `src/shared/components/FormDatePicker.tsx`

**Description**: FormDatePicker component

---

#### FormInput

**File**: `src/shared/components/FormInput.tsx`

**Description**: Whether this input is used as a title field

---

#### FormMoodSelector

**File**: `src/shared/components/FormMoodSelector.tsx`

**Description**: FormMoodSelector component

---

#### FormRadioGroup

**File**: `src/shared/components/FormRadioGroup.tsx`

**Description**: FormRadioGroup component for selecting a single option from a list of options

---

#### FormSelect

**File**: `src/shared/components/FormSelect.tsx`

**Description**: FormSelect component for selecting an option from a dropdown

---

#### FormSwitch

**File**: `src/shared/components/FormSwitch.tsx`

**Description**: FormSwitch component

---

#### FormTagInput

**File**: `src/shared/components/FormTagInput.tsx`

**Description**: FormTagInput component

---

#### FormTextarea

**File**: `src/shared/components/FormTextarea.tsx`

**Description**: FormTextarea component

---

## Usage Guidelines

### Import Patterns
Always import shared components from the shared components directory:

```typescript
// ✅ Correct
import { Button, Typography, Card } from '../shared/components';
import { FormInput, FormSelect } from '../shared/components';

// ❌ Incorrect - don't import individually unless necessary
import Button from '../shared/components/Button';
```

### Theme Integration
All components are designed to work with the theme system:

```typescript
import { useTheme } from '../../app/contexts/ThemeContext';

const { theme } = useTheme();
// Components automatically use theme tokens
```

### Consistency Checklist
Before creating any UI:
- [ ] Check if a shared component exists for your use case
- [ ] Use theme tokens for any custom styling
- [ ] Follow established component patterns
- [ ] Implement proper TypeScript interfaces
- [ ] Add loading and error states where appropriate

### When to Create New Components
Only create new shared components when:
1. The pattern will be reused 3+ times across the app
2. No existing component can be adapted for your needs
3. The component follows the established design system
4. You place it in `/src/shared/components/`
5. You export proper TypeScript interfaces
6. You use theme tokens consistently

## Component Creation Template

```typescript
import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { StyleProps } from './shared-props';

export interface MyComponentProps extends StyleProps {
  // Define component-specific props here
}

export const MyComponent: React.FC<MyComponentProps> = ({
  style,
  ...props
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.radius.m,
    },
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Component content */}
    </View>
  );
};
```

---

*This documentation is auto-generated. To update, run: `node scripts/generate-component-docs.js`*
