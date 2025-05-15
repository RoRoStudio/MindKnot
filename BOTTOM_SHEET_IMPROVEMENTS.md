# BottomSheet System Improvements

This document describes the improvements made to the bottom sheet system in the MindKnot app. 

## Overview of Changes

1. **Enhanced Base BottomSheet Component**
   - Added smooth animation for dismissal
   - Improved scrolling throughout the entire sheet
   - Added support for static footer with action buttons
   - Added configurable snap points for different heights
   - Added support for multiple animations and behaviors

2. **Global Configuration System**
   - Created `BottomSheetConfigProvider` for app-wide sheet configuration
   - Allows for easy global adjustments without editing individual sheets
   - Individual sheets can still override global settings when needed

3. **FormSheet Component**
   - Created a reusable base component for all entry form sheets
   - Standardized header and footer layout
   - Provides consistent positioning of action buttons
   - Handles form submission states

## New Components

### BottomSheet.tsx
- Now includes a ScrollView to enable scrolling anywhere in the sheet
- Adds animated transitions when opening and closing
- Supports custom snap points for different heights
- Includes configurable footer that stays fixed at the bottom

### BottomSheetConfig.tsx
- Provides global configuration options for all bottom sheets
- Can be easily updated app-wide
- Defines default styles and behaviors

### FormSheet.tsx
- Builds on top of BottomSheet for form-specific functionality
- Standardizes headers with title and close button
- Creates a fixed footer with submit/action buttons
- Handles form submission states (loading, success, etc.)

## Usage

### Basic Usage
```tsx
<BottomSheet
  visible={visible}
  onClose={onClose}
  footerContent={<Button onPress={onSave}>Save</Button>}
>
  <YourContent />
</BottomSheet>
```

### Form Sheet Usage
```tsx
<FormSheet
  visible={visible}
  onClose={onClose}
  title="Create Entry"
  onSubmit={handleSubmit(onSave)}
  isSubmitting={isSubmitting}
  isEdit={false}
>
  <YourFormFields />
</FormSheet>
```

### Custom Configuration
```tsx
// In a component:
const { updateConfig } = useBottomSheetConfig();

// Update all bottom sheets:
updateConfig({
  animationDuration: 400,
  backdropOpacity: 0.7,
});

// Or just for one sheet:
<FormSheet
  bottomSheetProps={{
    animationDuration: 500,
    maxHeight: 0.8, // 80% of screen height
  }}
  {...otherProps}
>
  <Content />
</FormSheet>
```

## Benefits

1. **Improved User Experience**
   - Smoother animations
   - Better scrolling behavior (can scroll anywhere)
   - Consistent action button placement
   - More intuitive interaction patterns

2. **Developer Experience**
   - Easier to maintain with centralized configuration
   - More consistent implementation across different entry types
   - Reduced code duplication
   - Future-proof architecture for additional improvements

3. **Code Quality**
   - Better TypeScript typing and component interfaces
   - Cleaner component hierarchy and separation of concerns
   - More modular and reusable components 