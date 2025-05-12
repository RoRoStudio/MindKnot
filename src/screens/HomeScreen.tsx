// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to MindKnot</Text>
            <Button title="Go to Sagas" onPress={() => navigation.navigate('Sagas')} />
        </View>
    );
}
