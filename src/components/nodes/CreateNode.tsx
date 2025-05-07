// src/components/nodes/CreateNode.tsx

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useMindMapStore } from '../../state/useMindMapStore';

const templates = [
  { type: 'quicknote', label: '📝' },
  { type: 'checklist', label: '☑️' },
  { type: 'bullet', label: '🔘' },
];

export default function CreateNode() {
  const addNode = useMindMapStore((s) => s.addNode);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const handleTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log('[CreateNode] Tap at:', locationX, locationY);
    setMenuPosition({ x: locationX, y: locationY });
  };

  const handleCreate = (template: string) => {
    if (!menuPosition) return;

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const icon = templates.find((t) => t.type === template)?.label || '📝';

    const node = {
      x: menuPosition.x,
      y: menuPosition.y,
      color,
      icon,
      template: template as any,
      title: 'New ' + template,
    };

    console.log('[CreateNode] Creating node:', node);
    addNode(node);
    setMenuPosition(null);
  };

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
      {menuPosition && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[
            styles.radialMenu,
            { left: menuPosition.x - 28, top: menuPosition.y - 28 },
          ]}
        >
          <TouchableOpacity
            style={[styles.centerButton, styles.cancelButton]}
            onPress={() => setMenuPosition(null)}
          >
            <Text style={styles.icon}>✕</Text>
          </TouchableOpacity>

          {templates.map((tpl, idx) => {
            const angle = (idx / templates.length) * 2 * Math.PI;
            const radius = 70;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <TouchableOpacity
                key={tpl.type}
                style={[
                  styles.radialButton,
                  { left: x + 28, top: y + 28 },
                ]}
                onPress={() => handleCreate(tpl.type)}
              >
                <Text style={styles.icon}>{tpl.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radialMenu: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 100,
  },
  radialButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  centerButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EB5757',
    zIndex: 10,
  },
  cancelButton: {
    left: 0,
    top: 0,
  },
  icon: {
    fontSize: 20,
  },
});