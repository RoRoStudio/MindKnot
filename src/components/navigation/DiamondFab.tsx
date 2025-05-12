// src/components/navigation/DiamondFab.tsx
import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import { Icon } from '../common/Icon';

const FAB_SIZE = 56;
const CORNER_RADIUS = 8;

interface DiamondFabProps {
    onPress: () => void;
}

export function DiamondFab({ onPress }: DiamondFabProps) {
    return (
        <TouchableOpacity
            style={styles.fabContainer}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create new entry"
        >
            <View style={styles.diamond}>
                <View style={styles.iconContainer}>
                    <Icon name="plus" width={24} height={24} color="white" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        width: FAB_SIZE,
        height: FAB_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        top: -FAB_SIZE / 2, // Position the FAB to stick out half way from the navbar
        left: '50%',
        marginLeft: -FAB_SIZE / 2, // Center horizontally (alternative to translateX)
        zIndex: 1001,
    },
    diamond: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        backgroundColor: '#000000',
        borderRadius: CORNER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
            { rotate: '45deg' }, // Rotate to create diamond shape
        ],
        // Improved shadow properties
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    iconContainer: {
        transform: [
            { rotate: '-45deg' }, // Counter-rotate the icon to make it straight
        ],
    },
});