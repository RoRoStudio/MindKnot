import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Canvas from '../components/canvas/Canvas';
import { useMindMapStore } from '../state/useMindMapStore';
import PanZoomLayer from '../components/canvas/PanZoomLayer';
import CreateNode from '../components/nodes/CreateNode';

export default function CanvasScreen() {
    const loadNodes = useMindMapStore((s) => s.loadNodes);
    const clearNodes = useMindMapStore((s) => s.clearAllNodes);

    useEffect(() => {
        loadNodes();
    }, []);

    return (
        <View style={styles.container}>
            <PanZoomLayer>
                <Canvas />
                <CreateNode />
            </PanZoomLayer>
            <Pressable style={styles.fab} onPress={clearNodes}>
                <Text style={styles.fabText}>🗑</Text>
            </Pressable>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#EB5757',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    fabText: {
        fontSize: 24,
        color: '#fff',
    },
});
