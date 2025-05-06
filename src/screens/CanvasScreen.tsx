import React from 'react';
import { View, StyleSheet } from 'react-native';
import Canvas from '../components/canvas/Canvas';

export default function CanvasScreen() {
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