// src/screens/CaptureScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import CaptureForm from '../components/captures/CaptureForm';
import { useCaptures } from '../hooks/useCaptures';
import { useSagas } from '../hooks/useSagas';

type RouteParams = {
    type?: string;
    captureId?: string;
    sagaId?: string;
};

export default function CaptureScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { addCapture, loading } = useCaptures();
    const { sagas } = useSagas();

    // Extract params
    const captureType = route.params?.type || 'note';
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
            const success = await addCapture({
                type: 'capture',
                subType: captureType,
                ...data,
            });

            if (success) {
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the capture. Please try again.');
            }
        } catch (error) {
            console.error('Error saving capture:', error);
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
                    {captureType === 'note' && 'Create Note'}
                    {captureType === 'spark' && 'Capture Insight'}
                    {captureType === 'action' && 'Add Action'}
                    {captureType === 'reflection' && 'New Reflection'}
                </Typography>
            </View>

            <View style={styles.content}>
                <CaptureForm
                    onSubmit={handleFormSubmit}
                    sagas={sagas}
                    initialData={{
                        subType: captureType,
                        sagaId: sagaId || ''
                    }}
                />
            </View>
        </SafeAreaView>
    );
}