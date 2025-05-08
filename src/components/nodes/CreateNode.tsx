// src/components/nodes/CreateNode.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable, Alert, Dimensions } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import { Icon } from '../common/Icon';

// Template definitions with icons and colors
const templates = [
  { type: 'quicknote', iconName: 'file-text', name: 'Note', color: '#2D9CDB' },
  { type: 'checklist', iconName: 'check-square', name: 'Checklist', color: '#6FCF97' },
  { type: 'bullet', iconName: 'list', name: 'Bullet', color: '#BB6BD9' },
  { type: 'decision', iconName: 'git-branch', name: 'Decision', color: '#F2994A' },
];

interface CreateNodeProps {
  onComplete?: () => void;
}

export default function CreateNode({ onComplete }: CreateNodeProps) {
  // Only use essential hooks
  const addNode = useMindMapStore((s) => s.addNode);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Get screen dimensions using Dimensions API
  const { width, height } = Dimensions.get('window');

  // Set a default position when component mounts if none is set
  useEffect(() => {
    if (!menuPosition) {
      console.log('Setting default menu position');
      // Default to center of screen
      setMenuPosition({
        x: width / 2,
        y: height / 2
      });
    }
  }, []);

  // Handle canvas tap to create a node
  const handleTap = (event: any) => {
    console.log('[CreateNode] Tap handled');

    // Get the touch coordinates
    const { locationX, locationY } = event.nativeEvent;
    console.log('[CreateNode] Tap at:', locationX, locationY);

    // Set the menu position
    setMenuPosition({ x: locationX, y: locationY });
  };

  // Create a node of the selected template type
  const handleCreate = (template: string) => {
    if (!menuPosition) {
      Alert.alert('Error', 'Cannot determine position for new node');
      return;
    }

    // Find template info
    const templateInfo = templates.find(t => t.type === template);
    if (!templateInfo) return;

    const node = {
      x: menuPosition.x,
      y: menuPosition.y,
      color: templateInfo.color,
      icon: templateInfo.iconName,
      template: template as any,
      title: 'New ' + templateInfo.name,
    };

    console.log('[CreateNode] Creating node:', node);
    addNode(node);

    if (onComplete) {
      onComplete();
    }
  };

  // Cancel menu
  const handleCancel = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
      >
        <View style={styles.pressableArea} />
      </Pressable>

      {menuPosition && (
        <View style={styles.menuBackground}>
          <View style={[
            styles.menu,
            {
              left: Math.max(20, Math.min(menuPosition.x - 100, width - 220)),
              top: Math.max(20, Math.min(menuPosition.y - 100, height - 300))
            }
          ]}>
            <Text style={styles.menuTitle}>Create New Node</Text>

            {templates.map((tpl) => (
              <TouchableOpacity
                key={tpl.type}
                style={styles.templateButton}
                onPress={() => handleCreate(tpl.type)}
              >
                <View style={[styles.iconContainer, { backgroundColor: tpl.color }]}>
                  <Icon name={tpl.iconName as any} width={24} height={24} stroke="#fff" />
                </View>
                <Text style={styles.templateName}>{tpl.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pressableArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.01)', // Almost transparent but still catches touches
  },
  menuBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
  },
  menu: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 550,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EB5757',
  }
});