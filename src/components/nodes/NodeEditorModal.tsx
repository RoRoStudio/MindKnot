import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, Button, Text } from 'react-native';
import { Node } from '../../types/Node';
import { useNodeStore } from '../../state/useNodeStore';

type Props = {
    visible: boolean;
    onClose: () => void;
    node: Node;
};

export default function NodeEditorModal({ visible, onClose, node }: Props) {
    const [title, setTitle] = useState(node.title);
    const [color, setColor] = useState(node.color);
    const [radius, setRadius] = useState(node.radius.toString());

    const save = () => {
        useNodeStore.setState((s) => ({
            nodes: s.nodes.map((n) =>
                n.id === node.id ? {
                    ...n,
                    title,
                    color,
                    radius: parseInt(radius) || node.radius
                } : n
            ),
        }));
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.label}>Node Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Title"
                    />

                    <Text style={styles.label}>Color (Hex)</Text>
                    <TextInput
                        style={styles.input}
                        value={color}
                        onChangeText={setColor}
                        placeholder="#RRGGBB"
                    />

                    <Text style={styles.label}>Size</Text>
                    <TextInput
                        style={styles.input}
                        value={radius}
                        onChangeText={setRadius}
                        placeholder="Size (radius)"
                        keyboardType="numeric"
                    />

                    <View style={styles.buttonContainer}>
                        <Button title="Save" onPress={save} />
                        <Button title="Cancel" onPress={onClose} color="gray" />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        width: '80%',
    },
    label: {
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 16,
        padding: 8,
        borderRadius: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    }
});