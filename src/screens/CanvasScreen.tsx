import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../theme/light';
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
        backgroundColor: lightTheme.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: lightTheme.textPrimary,
        fontSize: 18,
    },
});
