#!/usr/bin/env node

/**
 * Component Documentation Generator
 * Generates comprehensive documentation of all shared components
 * Run with: node scripts/generate-component-docs.js
 */

const fs = require('fs');
const path = require('path');

const SHARED_COMPONENTS_DIR = path.join(__dirname, '../src/shared/components');
const OUTPUT_FILE = path.join(__dirname, '../COMPONENT_LIBRARY.md');

// Component categories for better organization
const COMPONENT_CATEGORIES = {
    'Button.tsx': 'Core UI',
    'Typography.tsx': 'Core UI',
    'Card.tsx': 'Core UI',
    'Icon.tsx': 'Core UI',
    'FormInput.tsx': 'Form Components',
    'FormTextarea.tsx': 'Form Components',
    'FormSelect.tsx': 'Form Components',
    'FormDatePicker.tsx': 'Form Components',
    'FormSwitch.tsx': 'Form Components',
    'FormCheckbox.tsx': 'Form Components',
    'FormRadioGroup.tsx': 'Form Components',
    'FormMoodSelector.tsx': 'Form Components',
    'FormCategorySelector.tsx': 'Form Components',
    'FormTagInput.tsx': 'Form Components',
    'BottomSheet.tsx': 'Layout Components',
    'FormSheet.tsx': 'Layout Components',
    'FormModal.tsx': 'Layout Components',
    'ConfirmationModal.tsx': 'Layout Components',
    'FilterableList.tsx': 'Layout Components',
    'BaseEntityScreen.tsx': 'Layout Components',
    'EntryCard.tsx': 'Specialized Components',
    'EntryDetailHeader.tsx': 'Specialized Components',
    'CategoryPill.tsx': 'Specialized Components',
    'DiamondFab.tsx': 'Specialized Components',
    'BeautifulTimer.tsx': 'Specialized Components',
    'CustomBottomNavBar.tsx': 'Specialized Components',
};

function extractComponentInfo(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        // Extract component name
        const componentName = fileName.replace('.tsx', '');

        // Extract interface/props
        const interfaceMatch = content.match(/export interface (\w+Props)[^{]*{([^}]+(?:{[^}]*}[^}]*)*)/s);
        const propsInterface = interfaceMatch ? interfaceMatch[2] : null;

        // Extract JSDoc examples
        const exampleMatches = content.match(/\* @example\s*\n\s*\* ```jsx\n([\s\S]*?)\* ```/);
        const examples = exampleMatches ? exampleMatches[1].replace(/\* /g, '') : null;

        // Extract component description
        const descriptionMatch = content.match(/\/\*\*\s*\n\s*\* (.+?)\n/);
        const description = descriptionMatch ? descriptionMatch[1] : `${componentName} component`;

        // Extract variants/types
        const variantMatches = content.match(/export type (\w+(?:Variant|Size|Color|Type))\s*=\s*([^;]+);/g);
        const variants = variantMatches ? variantMatches.map(match => {
            const [, name, values] = match.match(/export type (\w+)\s*=\s*([^;]+);/);
            return { name, values: values.replace(/\s+/g, ' ').trim() };
        }) : [];

        return {
            name: componentName,
            fileName,
            category: COMPONENT_CATEGORIES[fileName] || 'Other',
            description,
            propsInterface,
            examples,
            variants,
            path: `src/shared/components/${fileName}`
        };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return null;
    }
}

function generateMarkdown(components) {
    const componentsByCategory = components.reduce((acc, comp) => {
        if (!acc[comp.category]) acc[comp.category] = [];
        acc[comp.category].push(comp);
        return acc;
    }, {});

    let markdown = `# MindKnot Component Library Documentation

*Auto-generated on ${new Date().toISOString()}*

This document provides comprehensive documentation of all shared components in the MindKnot app. Always reference this when implementing UI to ensure consistency.

## Quick Reference

| Component | Category | Description |
|-----------|----------|-------------|
`;

    // Add quick reference table
    components.forEach(comp => {
        markdown += `| [${comp.name}](#${comp.name.toLowerCase()}) | ${comp.category} | ${comp.description} |\n`;
    });

    markdown += '\n## Component Categories\n\n';

    // Generate detailed documentation by category
    Object.entries(componentsByCategory).forEach(([category, comps]) => {
        markdown += `### ${category}\n\n`;

        comps.forEach(comp => {
            markdown += `#### ${comp.name}\n\n`;
            markdown += `**File**: \`${comp.path}\`\n\n`;
            markdown += `**Description**: ${comp.description}\n\n`;

            if (comp.variants.length > 0) {
                markdown += '**Available Types/Variants**:\n';
                comp.variants.forEach(variant => {
                    markdown += `- \`${variant.name}\`: ${variant.values}\n`;
                });
                markdown += '\n';
            }

            if (comp.propsInterface) {
                markdown += '**Props Interface**:\n```typescript\n';
                markdown += comp.propsInterface.trim();
                markdown += '\n```\n\n';
            }

            if (comp.examples) {
                markdown += '**Usage Examples**:\n```jsx\n';
                markdown += comp.examples.trim();
                markdown += '\n```\n\n';
            }

            markdown += '---\n\n';
        });
    });

    // Add usage guidelines
    markdown += `## Usage Guidelines

### Import Patterns
Always import shared components from the shared components directory:

\`\`\`typescript
// ✅ Correct
import { Button, Typography, Card } from '../shared/components';
import { FormInput, FormSelect } from '../shared/components';

// ❌ Incorrect - don't import individually unless necessary
import Button from '../shared/components/Button';
\`\`\`

### Theme Integration
All components are designed to work with the theme system:

\`\`\`typescript
import { useTheme } from '../../app/contexts/ThemeContext';

const { theme } = useTheme();
// Components automatically use theme tokens
\`\`\`

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
4. You place it in \`/src/shared/components/\`
5. You export proper TypeScript interfaces
6. You use theme tokens consistently

## Component Creation Template

\`\`\`typescript
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
\`\`\`

---

*This documentation is auto-generated. To update, run: \`node scripts/generate-component-docs.js\`*
`;

    return markdown;
}

function main() {
    console.log('🔍 Scanning shared components...');

    if (!fs.existsSync(SHARED_COMPONENTS_DIR)) {
        console.error('❌ Shared components directory not found:', SHARED_COMPONENTS_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(SHARED_COMPONENTS_DIR)
        .filter(file => file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.stories.'))
        .map(file => path.join(SHARED_COMPONENTS_DIR, file));

    console.log(`📄 Found ${files.length} component files`);

    const components = files
        .map(extractComponentInfo)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`✅ Processed ${components.length} components`);

    const markdown = generateMarkdown(components);

    // Ensure scripts directory exists
    const scriptsDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, markdown);

    console.log(`📚 Component documentation generated: ${OUTPUT_FILE}`);
    console.log('💡 Add this file to your .cursorrules or reference it in chats for consistency!');
}

if (require.main === module) {
    main();
}

module.exports = { extractComponentInfo, generateMarkdown }; 