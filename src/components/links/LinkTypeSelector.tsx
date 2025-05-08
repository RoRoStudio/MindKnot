// src/components/links/LinkTypeSelector.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import { Icon } from '../common/Icon';

interface LinkTypeSelectorProps {
    visible: boolean;
    onSelectType: (type: string) => void;
    onCancel: () => void;
}

const linkTypes = [
    { id: 'default', name: 'Default', color: '#666666', iconName: 'minus' },
    { id: 'cause', name: 'Cause/Effect', color: '#F2994A', iconName: 'arrow-right' },
    { id: 'reference', name: 'Reference', color: '#2D9CDB', iconName: 'link' },
    { id: 'related', name: 'Related', color: '#BB6BD9', iconName: 'sparkles' },
];

export default function LinkTypeSelector({ visible, onSelectType, onCancel }: LinkTypeSelectorProps) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <Pressable
                style={styles.overlay}
                onPress={onCancel}
            >
                <View
                    style={styles.modalContent}
                    // Prevent clicks on container from bubbling to overlay
                    onStartShouldSetResponder={() => true}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>Select Link Type</Text>

                    {linkTypes.map(type => (
                        <TouchableOpacity
                            key={type.id}
                            activeOpacity={0.7}
                            style={styles.typeButton}
                            onPress={() => {
                                console.log(`Selected type: ${type.id}`);
                                onSelectType(type.id);
                            }}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: type.color }]}>
                                <Icon name={type.iconName as any} width={24} height={24} stroke="#fff" />
                            </View>
                            <Text style={styles.typeName}>{type.name}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                        onPress={() => {
                            console.log('Cancel pressed');
                            onCancel();
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
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
        backgroundColor: '#f8f8f8',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    typeName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
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