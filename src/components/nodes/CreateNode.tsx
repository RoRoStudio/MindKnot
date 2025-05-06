// src/components/nodes/CreateNode.tsx

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useMindMapStore } from '../../state/useMindMapStore';
import { NodeTemplate } from '../../types/NodeTypes';
import { runOnJS } from 'react-native-reanimated';

const templateOptions: { type: NodeTemplate; label: string; icon: string }[] = [
    { type: 'quicknote', label: '📝', icon: '📝' },
    { type: 'checklist', label: '☑️', icon: '☑️' },
    { type: 'bullet', label: '•', icon: '🔘' },
];

export default function CreateNode() {
    const addNode = useMindMapStore((s) => s.addNode);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const handleTap = (x: number, y: number) => {
        console.log('[CreateNode] Gesture tap at:', x, y);
        setMenuPosition({ x, y });
    };

    const handleCreate = async (template: NodeTemplate) => {
        if (!menuPosition) {
            console.warn('[CreateNode] Tried to create node but no menuPosition is set.');
            return;
        }

        try {
            const selected = templateOptions.find((t) => t.type === template);
            const icon = selected?.icon || '🔖';
            const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

            const payload = {
                x: menuPosition.x,
                y: menuPosition.y,
                color,
                title: 'New ' + template,
                template,
                icon,
            };

            console.log('[CreateNode] Creating node with payload:', payload);
            await addNode(payload);
            console.log('[CreateNode] Node creation successful');
        } catch (err) {
            console.error('[CreateNode] Error creating node:', err);
        } finally {
            setMenuPosition(null);
        }
    };

    const tap = Gesture.Tap().onEnd((e) => {
        try {
            console.log('[CreateNode] Tap gesture end triggered');
            runOnJS(handleTap)(e.absoluteX, e.absoluteY);
        } catch (err) {
            console.error('[CreateNode] Error in tap gesture handler:', err);
        }
    });

    return (
        <GestureDetector gesture={tap}>
            <View style={StyleSheet.absoluteFill}>
                {menuPosition && (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[styles.radialMenu, {
                            left: menuPosition.x - 28,
                            top: menuPosition.y - 28,
                        }]}
                    >
                        <TouchableOpacity
                            style={[styles.centerButton, styles.cancelButton]}
                            onPress={() => {
                                console.log('[CreateNode] Cancel button pressed');
                                setMenuPosition(null);
                            }}
                        >
                            <Text style={styles.icon}>✕</Text>
                        </TouchableOpacity>

                        {templateOptions.map((tpl, idx) => {
                            const angle = (idx / templateOptions.length) * 2 * Math.PI;
                            const radius = 70;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            return (
                                <TouchableOpacity
                                    key={tpl.type}
                                    style={[styles.radialButton, {
                                        left: x + 28,
                                        top: y + 28,
                                    }]}
                                    onPress={() => {
                                        console.log('[CreateNode] Pressed template button:', tpl.type);
                                        handleCreate(tpl.type);
                                    }}
                                >
                                    <Text style={styles.icon}>{tpl.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </Animated.View>
                )}
            </View>
        </GestureDetector>
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
