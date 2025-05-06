import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { useMindMapStore } from '../../state/useMindMapStore';

export default function CreateNode() {
    const addNode = useMindMapStore((s) => s.addNode);
    const nodes = useMindMapStore((s) => s.nodes);

    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const handleTap = (x: number, y: number) => {
        console.log('Tapped at:', x, y);
        setMenuPosition({ x, y });
    };

    const handleCreate = (template: string) => {
        if (!menuPosition) return;

        const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        addNode({
            x: menuPosition.x,
            y: menuPosition.y,
            color,
            title: `New ${template}`,
            template: template as any,
        });
        setMenuPosition(null);
    };

    const tap = Gesture.Tap().onEnd((e) => {
        runOnJS(handleTap)(e.absoluteX, e.absoluteY);
    });

    return (
        <GestureDetector gesture={tap}>
            <View style={StyleSheet.absoluteFill}>
                {menuPosition && (
                    <View style={[styles.menu, { left: menuPosition.x, top: menuPosition.y }]}>
                        <TouchableOpacity onPress={() => handleCreate('quicknote')}>
                            <Text style={styles.item}>Quick Note</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCreate('checklist')}>
                            <Text style={styles.item}>Checklist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCreate('decision')}>
                            <Text style={styles.item}>Decision</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCreate('bullet')}>
                            <Text style={styles.item}>Bullet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMenuPosition(null)}>
                            <Text style={[styles.item, styles.cancel]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    menu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 4,
        padding: 8,
        zIndex: 99,
    },
    item: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#1A1A1A',
    },
    cancel: {
        color: '#EB5757',
        fontWeight: 'bold',
        marginTop: 6,
    },
});
