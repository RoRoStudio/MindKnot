import React from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { NodeModel } from '../../types/NodeTypes';

export default function NodeEditor({ node, onClose }: { node: NodeModel, onClose: () => void }) {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{node.title}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.close}>✕</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                multiline
                placeholder="Write your note here..."
                defaultValue={node.body}
                style={styles.input}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    close: {
        fontSize: 24,
        color: '#EB5757',
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        padding: 8,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
    },
});
