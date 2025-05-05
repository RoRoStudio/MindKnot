import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../theme/light';

export default function CanvasScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>This is the Canvas screen</Text>
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
