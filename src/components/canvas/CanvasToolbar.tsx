// src/components/canvas/CanvasToolbar.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '../common/Icon';

interface ToolbarProps {
    onAddNode: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onClearCanvas: () => void;
    hasUndoHistory?: boolean;
    hasRedoHistory?: boolean;
}

export default function CanvasToolbar({
    onAddNode,
    onUndo,
    onRedo,
    onClearCanvas,
    hasUndoHistory = false,
    hasRedoHistory = false
}: ToolbarProps) {
    const handleAddPress = () => {
        console.log('Add button pressed in toolbar');
        onAddNode();
    };

    return (
        <Animated.View
            style={styles.container}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
        >
            <TouchableOpacity
                style={styles.button}
                onPress={handleAddPress}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>➕</Text>
            </TouchableOpacity>

            {onUndo && (
                <TouchableOpacity
                    style={[styles.button, !hasUndoHistory && styles.buttonDisabled]}
                    onPress={onUndo}
                    disabled={!hasUndoHistory}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>↩️</Text>
                </TouchableOpacity>
            )}

            {onRedo && (
                <TouchableOpacity
                    style={[styles.button, !hasRedoHistory && styles.buttonDisabled]}
                    onPress={onRedo}
                    disabled={!hasRedoHistory}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>↪️</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={onClearCanvas}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>🗑️</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 24,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 900, // High z-index to ensure it's above other elements
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    buttonDisabled: {
        backgroundColor: '#333',
        opacity: 0.5,
    },
    dangerButton: {
        backgroundColor: '#EB5757',
    },
    buttonText: {
        fontSize: 18,
    }
});