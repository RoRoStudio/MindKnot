#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Migration patterns
const migrations = {
    // Hook migration
    useStylesImport: {
        from: /import { useStyles } from ['"]\.\.\/hooks\/useStyles['"];?/g,
        to: "import { useThemedStyles } from '../hooks/useThemedStyles';"
    },
    useStylesUsage: {
        from: /const styles = useStyles\(/g,
        to: "const styles = useThemedStyles("
    },

    // Border radius migrations
    borderRadius: {
        'borderRadius: 2': 'borderRadius: theme.shape.radius.xs',
        'borderRadius: 4': 'borderRadius: theme.shape.radius.s',
        'borderRadius: 8': 'borderRadius: theme.shape.radius.m',
        'borderRadius: 10': 'borderRadius: theme.shape.radius.m',
        'borderRadius: 12': 'borderRadius: theme.shape.radius.l',
        'borderRadius: 16': 'borderRadius: theme.shape.radius.xl',
        'borderRadius: 18': 'borderRadius: theme.shape.radius.xl',
        'borderRadius: 20': 'borderRadius: theme.shape.radius.xxl',
        'borderRadius: 24': 'borderRadius: theme.shape.radius.xxl',
        'borderRadius: 36': 'borderRadius: theme.shape.radius.xxl',
        'borderRadius: 100': 'borderRadius: theme.shape.radius.pill',
        'borderRadius: 999': 'borderRadius: theme.shape.radius.pill',
        'borderRadius: 9999': 'borderRadius: theme.shape.radius.pill',
    },

    // Common hardcoded values
    spacing: {
        'padding: 4': 'padding: theme.spacing.xs',
        'padding: 8': 'padding: theme.spacing.s',
        'padding: 16': 'padding: theme.spacing.m',
        'padding: 24': 'padding: theme.spacing.l',
        'margin: 4': 'margin: theme.spacing.xs',
        'margin: 8': 'margin: theme.spacing.s',
        'margin: 16': 'margin: theme.spacing.m',
        'margin: 24': 'margin: theme.spacing.l',
    }
};

// Components that need migration (in priority order)
const componentsToMigrate = [
    // High Priority - Form Components
    'FormInput.tsx',
    'FormSelect.tsx',
    'FormTextarea.tsx',
    'FormDatePicker.tsx',
    'FormCheckbox.tsx',
    'FormSwitch.tsx',
    'FormRadioGroup.tsx',
    'FormTagInput.tsx',
    'FormCategorySelector.tsx',
    'FormMoodSelector.tsx',
    'FormLabelInput.tsx',
    'FormArrayField.tsx',
    'FormErrorMessage.tsx',
    'FormModal.tsx',
    'Form.tsx',

    // Medium Priority - Layout Components  
    'BaseEntityScreen.tsx',
    'FilterableList.tsx',
    'FilterableListHeader.tsx',
    'BottomSheet.tsx',
    'ConfirmationModal.tsx',

    // Lower Priority - Specialized Components
    'EntryDetailHeader.tsx',
    'EntryMetadataBar.tsx',
    'EntryCard.tsx',
    'CustomBottomNavBar.tsx',
    'DiamondFab.tsx',
    'CategoryManager.tsx',
    'IconPicker.tsx',
    'ColorPicker.tsx',
    'CategoryPill.tsx',
    'BeautifulTimer.tsx',
    'ExpandableLoopHeader.tsx',
    'LoopExecutionHeader.tsx'
];

function migrateFile(filePath) {
    console.log(`Migrating: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Migrate useStyles import and usage
    if (content.includes('useStyles')) {
        content = content.replace(migrations.useStylesImport.from, migrations.useStylesImport.to);
        content = content.replace(migrations.useStylesUsage.from, migrations.useStylesUsage.to);
        hasChanges = true;
        console.log(`  ✓ Migrated useStyles to useThemedStyles`);
    }

    // Migrate border radius values
    for (const [from, to] of Object.entries(migrations.borderRadius)) {
        if (content.includes(from)) {
            content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
            hasChanges = true;
            console.log(`  ✓ Replaced ${from} with ${to}`);
        }
    }

    // Migrate spacing values
    for (const [from, to] of Object.entries(migrations.spacing)) {
        if (content.includes(from)) {
            content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
            hasChanges = true;
            console.log(`  ✓ Replaced ${from} with ${to}`);
        }
    }

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Migration completed for ${path.basename(filePath)}`);
    } else {
        console.log(`  ⏭️  No changes needed for ${path.basename(filePath)}`);
    }

    return hasChanges;
}

function main() {
    console.log('🚀 Starting MindKnot Component Migration...\n');

    const componentsDir = path.join(__dirname, '../src/shared/components');
    let totalMigrated = 0;

    for (const componentFile of componentsToMigrate) {
        const filePath = path.join(componentsDir, componentFile);

        if (fs.existsSync(filePath)) {
            const migrated = migrateFile(filePath);
            if (migrated) totalMigrated++;
        } else {
            console.log(`⚠️  File not found: ${componentFile}`);
        }
        console.log(''); // Empty line for readability
    }

    console.log(`\n✅ Migration completed! ${totalMigrated} files were updated.`);
    console.log('\n📋 Next steps:');
    console.log('1. Review the changes in each file');
    console.log('2. Test the components to ensure they work correctly');
    console.log('3. Run the app to verify no visual regressions');
    console.log('4. Update the component documentation if needed');
}

if (require.main === module) {
    main();
}

module.exports = { migrateFile, migrations }; 