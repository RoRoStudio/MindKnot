import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NodeModel } from '../../types/NodeTypes';

type Props = {
    node: NodeModel;
};

export default function NodeCard({ node }: Props) {
    return (
        <View style={[styles.node, {
            backgroundColor: node.color,
            left: node.x,
            top: node.y,
        }]}>
            <Text style={styles.text}>{node.title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    node: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 16, // Rounded square
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
});
