// src/components/nodes/CreateNode.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';
import { useMindMapStore } from '../../state/useMindMapStore';
import { spacing, typography } from '../../styles';

// Template definitions
const templates = [
  { type: 'quicknote', label: '📝', name: 'Note' },
  { type: 'checklist', label: '✅', name: 'Checklist' },
  { type: 'bullet', label: '🔘', name: 'Bullet' },
  { type: 'decision', label: '🔄', name: 'Decision' },
];

export default function CreateNode() {
  const addNode = useMindMapStore((s) => s.addNode);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Shared values for radial button animations
  const buttonScale = useSharedValue(0);
  
  // Handle canvas tap to create a node
  const handleTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log('[CreateNode] Tap at:', locationX, locationY);
    
    // Open the radial menu
    setMenuPosition({ x: locationX, y: locationY });
    
    // Start animation
    buttonScale.value = withTiming(1, { duration: 300 });
  };

  // Create a node of the selected template type
  const handleCreate = (template: string) => {
    if (!menuPosition) return;

    // Generate a color based on template type (more intentional than random)
    const templateColors = {
      quicknote: '#2D9CDB',  // Blue
      checklist: '#6FCF97',  // Green
      bullet: '#BB6BD9',     // Purple
      decision: '#F2994A'    // Orange
    };
    
    const color = templateColors[template as keyof typeof templateColors] || '#2D9CDB';
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
    closeMenu();
  };
  
  // Close the radial menu
  const closeMenu = () => {
    buttonScale.value = withTiming(0, { duration: 200 });
    
    // Delay setting position to null until animation completes
    setTimeout(() => {
      setMenuPosition(null);
    }, 200);
  };

  // Generate animated styles for radial buttons
  const getRadialButtonStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const angle = (index / templates.length) * 2 * Math.PI;
      const radius = 80;
      const scale = buttonScale.value;
      
      // Calculate position based on angle and radius
      const x = Math.cos(angle) * radius * scale;
      const y = Math.sin(angle) * radius * scale;
      
      return {
        transform: [
          { translateX: x },
          { translateY: y },
          { scale: scale }
        ],
        opacity: scale,
      };
    });
  };

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
      {menuPosition && (
        <View style={[styles.menuContainer, { left: menuPosition.x, top: menuPosition.y }]}>
          {/* Center cancel button */}
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.centerButton}
          >
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={closeMenu}
            >
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Radial template buttons */}
          {templates.map((tpl, idx) => (
            <Animated.View
              key={tpl.type}
              style={[styles.buttonWrapper, getRadialButtonStyle(idx)]}
            >
              <TouchableOpacity
                style={[styles.templateButton, { backgroundColor: '#fff' }]}
                onPress={() => handleCreate(tpl.type)}
              >
                <Text style={styles.iconText}>{tpl.label}</Text>
                <Animated.Text 
                  entering={SlideInDown.delay(150 + idx * 50)}
                  style={styles.labelText}
                >
                  {tpl.name}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  centerButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cancelButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EB5757',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelText: {
    fontSize: 24,
    color: '#fff',
  },
  iconText: {
    fontSize: 24,
  },
  labelText: {
    position: 'absolute',
    bottom: -24,
    fontSize: typography.fontSize.s,
    fontWeight: typography.fontWeight.medium,
    color: '#1A1A1A',
    textAlign: 'center',
  }
});