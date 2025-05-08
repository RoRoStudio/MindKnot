// src/components/links/LinkTypeSelector.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';

interface LinkTypeSelectorProps {
    visible: boolean;
    onSelectType: (type: string) => void;
    onCancel: () => void;
}

const linkTypes = [
    { id: 'default', name: 'Default', color: '#666666', icon: '➖' },
    { id: 'cause', name: 'Cause/Effect', color: '#F2994A', icon: '🔄' },
    { id: 'reference', name: 'Reference', color: '#2D9CDB', icon: '🔗' },
    { id: 'related', name: 'Related', color: '#BB6BD9', icon: '✨' },
];

export default function LinkTypeSelector({ visible, onSelectType, onCancel }: LinkTypeSelectorProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Select Link Type</Text>

                    {linkTypes.map(type => (
                        <TouchableOpacity
                            key={type.id}
                            style={[styles.typeButton, { borderColor: type.color }]}
                            onPress={() => onSelectType(type.id)}
                        >
                            <Text style={styles.typeIcon}>{type.icon}</Text>
                            <Text style={styles.typeName}>{type.name}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 250,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 2,
        backgroundColor: '#f8f8f8',
    },
    typeIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    typeName: {
        fontSize: 16,
        fontWeight: '500',
    },
    cancelButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginTop: 8,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#EB5757',
    }
});