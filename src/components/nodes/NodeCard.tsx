import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { Node } from '../../types/Node';
import { useNodeStore } from '../../state/useNodeStore';
import NodeEditorModal from './NodeEditorModal';

type Props = { node: Node };

export default function NodeCard({ node }: Props) {
    const { updateNodePosition } = useNodeStore();
    const [modalVisible, setModalVisible] = useState(false);

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
            updateNodePosition(node.id, node.x + g.dx, node.y + g.dy);
        },
    });

    return (
        <>
            <TouchableOpacity
                onLongPress={() => setModalVisible(true)}
                style={[styles.node, { backgroundColor: node.color, left: node.x, top: node.y }]}
                {...panResponder.panHandlers}
            >
                <Text style={styles.text}>{node.title}</Text>
            </TouchableOpacity>

            <NodeEditorModal visible={modalVisible} onClose={() => setModalVisible(false)} node={node} />
        </>
    );
}

const styles = StyleSheet.create({
    node: {
        position: 'absolute',
        padding: 12,
        borderRadius: 8,
        minWidth: 80,
    },
    text: {
        color: '#fff',
    },
});
