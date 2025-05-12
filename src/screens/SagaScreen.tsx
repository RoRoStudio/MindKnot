// src/screens/SagaScreen.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';

const mockSagas = [
    { id: '1', name: 'Personal Growth' },
    { id: '2', name: 'Startup Journey' },
];

export default function SagaScreen() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 24 }}>Your Sagas</Text>
            <FlatList
                data={mockSagas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Text style={{ fontSize: 18 }}>{item.name}</Text>}
            />
        </View>
    );
}
