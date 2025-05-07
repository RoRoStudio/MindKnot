// src/components/nodes/CreateNode.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';

// Template definitions with colors
const templates = [
  { type: 'quicknote', label: '📝', name: 'Note', color: '#2D9CDB' },
  { type: 'checklist', label: '✅', name: 'Checklist', color: '#6FCF97' },
  { type: 'bullet', label: '🔘', name: 'Bullet', color: '#BB6BD9' },
  { type: 'decision', label: '🔄', name: 'Decision', color: '#F2994A' },
];

export default function CreateNode() {
  // Only use essential hooks
  const addNode = useMindMapStore((s) => s.addNode);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Handle canvas tap to create a node
  const handleTap = (event: any) => {
    if (menuPosition) {
      // If menu is already open, close it
      setMenuPosition(null);
    } else {
      // Open the menu
      const { locationX, locationY } = event.nativeEvent;
      console.log('[CreateNode] Tap at:', locationX, locationY);
      setMenuPosition({ x: locationX, y: locationY });
    }
  };

  // Create a node of the selected template type
  const handleCreate = (template: string) => {
    if (!menuPosition) return;

    // Find template info
    const templateInfo = templates.find(t => t.type === template);
    if (!templateInfo) return;

    const node = {
      x: menuPosition.x,
      y: menuPosition.y,
      color: templateInfo.color,
      icon: templateInfo.label,
      template: template as any,
      title: 'New ' + templateInfo.name,
    };

    console.log('[CreateNode] Creating node:', node);
    addNode(node);
    setMenuPosition(null);
  };

  // Cancel menu
  const handleCancel = () => {
    setMenuPosition(null);
  };

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
      {menuPosition && (
        <View style={styles.menuBackground}>
          <View style={[styles.menu, { left: menuPosition.x - 100, top: menuPosition.y - 100 }]}>
            {templates.map((tpl) => (
              <TouchableOpacity
                key={tpl.type}
                style={[styles.templateButton, { backgroundColor: tpl.color }]}
                onPress={() => handleCreate(tpl.type)}
              >
                <Text style={styles.templateIcon}>{tpl.label}</Text>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  templateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
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