// src/components/nodes/NodeEditor.tsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Text, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { NodeModel } from '../../types/NodeTypes';
import { spacing, typography } from '../../styles';
import { useMindMapStore } from '../../state/useMindMapStore';

interface NodeEditorProps {
  node: NodeModel;
  onClose: () => void;
}

// Colors for node backgrounds
const colorOptions = [
  '#2D9CDB', // Blue
  '#6FCF97', // Green
  '#F2994A', // Orange
  '#BB6BD9', // Purple
  '#EB5757', // Red
  '#F2C94C', // Yellow
];

// Status options
const statusOptions = [
  '',
  'idea',
  'note',
  'draft',
  'question'
];

export default function NodeEditor({ node, onClose }: NodeEditorProps) {
  const updateNode = useMindMapStore(state => state.updateNode);
  
  // Local state for form values
  const [title, setTitle] = useState(node.title);
  const [body, setBody] = useState(node.body || '');
  const [color, setColor] = useState(node.color);
  const [status, setStatus] = useState(node.status || '');
  
  // Handle save and close
  const handleSave = () => {
    updateNode({
      ...node,
      title,
      body,
      color,
      status,
      updatedAt: Date.now()
    });
    onClose();
  };
  
  // Generate content based on template type
  const renderTemplateContent = () => {
    switch(node.template) {
      case 'checklist':
        return (
          <View style={styles.checklist}>
            {/* Simplified checklist UI */}
            <Text style={styles.label}>Checklist Items:</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="- Item 1&#10;- Item 2&#10;- Item 3"
              value={body}
              onChangeText={setBody}
            />
          </View>
        );
        
      case 'bullet':
        return (
          <View style={styles.bullets}>
            <Text style={styles.label}>Bullet Points:</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
              value={body}
              onChangeText={setBody}
            />
          </View>
        );
        
      case 'decision':
        return (
          <View style={styles.decision}>
            <Text style={styles.label}>Decision Options:</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Option 1: Description&#10;Option 2: Description"
              value={body}
              onChangeText={setBody}
            />
          </View>
        );
        
      case 'quicknote':
      default:
        return (
          <TextInput
            style={styles.input}
            multiline
            placeholder="Write your note here..."
            value={body}
            onChangeText={setBody}
          />
        );
    }
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={SlideInUp.springify().damping(15)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Node</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollContent}>
          {/* Title input */}
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Node Title"
          />
          
          {/* Template-specific content */}
          <Text style={styles.label}>Content:</Text>
          {renderTemplateContent()}
          
          {/* Color picker */}
          <Text style={styles.label}>Color:</Text>
          <View style={styles.colorPicker}>
            {colorOptions.map(colorOption => (
              <TouchableOpacity
                key={colorOption}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorOption },
                  color === colorOption && styles.selectedColor
                ]}
                onPress={() => setColor(colorOption)}
              />
            ))}
          </View>
          
          {/* Status picker */}
          <Text style={styles.label}>Status:</Text>
          <View style={styles.statusPicker}>
            {statusOptions.map(option => (
              <TouchableOpacity
                key={option || 'none'}
                style={[
                  styles.statusOption,
                  status === option && styles.selectedStatus
                ]}
                onPress={() => setStatus(option)}
              >
                <Text style={styles.statusText}>
                  {option || 'None'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Save button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: typography.fontSize.l,
    fontWeight: typography.fontWeight.bold,
  },
  closeButton: {
    fontSize: 24,
    color: '#EB5757',
  },
  scrollContent: {
    flex: 1,
    padding: spacing.m,
  },
  label: {
    fontSize: typography.fontSize.m,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  titleInput: {
    fontSize: typography.fontSize.l,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: spacing.s,
    marginBottom: spacing.m,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: spacing.s,
    fontSize: typography.fontSize.m,
    textAlignVertical: 'top',
  },
  checklist: {
    marginBottom: spacing.m,
  },
  bullets: {
    marginBottom: spacing.m,
  },
  decision: {
    marginBottom: spacing.m,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.m,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: spacing.xs,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
  statusPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.m,
  },
  statusOption: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    margin: spacing.xs,
  },
  selectedStatus: {
    backgroundColor: '#333',
  },
  statusText: {
    fontSize: typography.fontSize.s,
    color: '#333',
  },
  footer: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#2D9CDB',
    borderRadius: 8,
    padding: spacing.m,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.m,
    fontWeight: typography.fontWeight.medium,
  }
});