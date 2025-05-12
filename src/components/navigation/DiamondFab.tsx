// src/components/navigation/DiamondFab.tsx
import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';
import { Icon } from '../common/Icon';

const { width } = Dimensions.get('window');
const FAB_SIZE = 56;
const CORNER_RADIUS = 8; // Slight rounding of corners

interface DiamondFabProps {
    onPress: () => void;
}

export function DiamondFab({ onPress }: DiamondFabProps) {
    return (
        <TouchableOpacity
            style={styles.fabContainer}
            onPress={onPress}
            activeOpacity={0.8}
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
        top: -FAB_SIZE / 2, // This matches the CSS top: -50%
        left: '50%',
        transform: [
            { translateX: -FAB_SIZE / 2 }, // Center horizontally
        ],
        zIndex: 1001,
    },
    diamond: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        backgroundColor: 'black',
        borderRadius: CORNER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
            { rotate: '45deg' }, // Rotate to create diamond shape
        ],
        // Shadow properties
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    iconContainer: {
        transform: [
            { rotate: '-45deg' }, // Counter-rotate the icon to make it straight
        ],
    },
});