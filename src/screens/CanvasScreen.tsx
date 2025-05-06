import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Canvas from '../components/canvas/Canvas';
import { useMindMapStore } from '../state/useMindMapStore';

export default function CanvasScreen() {
    const loadNodes = useMindMapStore((s) => s.loadNodes);

    useEffect(() => {
        loadNodes();
    }, []);

    return (
        <View style={styles.container}>
            <Canvas />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
