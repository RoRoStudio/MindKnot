import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, Button } from 'react-native';
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
    const { updateNodePosition } = useNodeStore();

    const save = () => {
        updateNodePosition(node.id, node.x, node.y); // Keep position
        useNodeStore.setState((s) => ({
            nodes: s.nodes.map((n) =>
                n.id === node.id ? { ...n, title, color } : n
            ),
        }));
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
                    <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="#RRGGBB" />
                    <Button title="Save" onPress={save} />
                    <Button title="Cancel" onPress={onClose} color="gray" />
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        padding: 8,
        borderRadius: 4,
    },
});
