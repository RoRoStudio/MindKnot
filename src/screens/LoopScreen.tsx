// src/screens/LoopScreen.tsx
import React from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import LoopForm from '../components/loops/LoopForm';
import { useLoops } from '../hooks/useLoops';
import { useSagas } from '../hooks/useSagas';

type RouteParams = {
    loopId?: string;
    sagaId?: string;
};

export default function LoopScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { addLoop, loading } = useLoops();
    const { sagas } = useSagas();

    // Extract params
    const sagaId = route.params?.sagaId;

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        backButton: {
            marginRight: theme.spacing.m,
        },
        title: {
            flex: 1,
        },
        content: {
            flex: 1,
        },
    }));

    const handleFormSubmit = async (data: any) => {
        try {
            const success = await addLoop({
                ...data,
                frequency: JSON.stringify(data.frequency)
            });

            if (success) {
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the loop. Please try again.');
            }
        } catch (error) {
            console.error('Error saving loop:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Button
                    variant="text"
                    label=""
                    leftIcon="arrow-left"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />
                <Typography variant="h2" style={styles.title}>
                    Create Loop
                </Typography>
            </View>

            <View style={styles.content}>
                <LoopForm
                    onSubmit={handleFormSubmit}
                    sagas={sagas}
                    initialData={{ sagaId: sagaId || '' }}
                />
            </View>
        </SafeAreaView>
    );
}