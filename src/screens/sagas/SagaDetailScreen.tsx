import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Icon } from '../../components/common';
import { RootStackParamList } from '../../types/navigation-types';
import { Saga } from '../../types/saga';
import { getSagaById } from '../../api/sagaService';
import { useStyles } from '../../hooks/useStyles';

type SagaDetailScreenRouteProp = RouteProp<RootStackParamList, 'SagaDetail'>;

const SagaDetailScreen = () => {
    const route = useRoute<SagaDetailScreenRouteProp>();
    const { sagaId } = route.params;
    const [saga, setSaga] = useState<Saga | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 16,
        },
        header: {
            marginBottom: 24,
        },
        content: {
            marginBottom: 16,
        },
        iconContainer: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        icon: {
            marginRight: 8,
        }
    }));

    useEffect(() => {
        const loadSaga = async () => {
            try {
                const sagaData = await getSagaById(sagaId);
                setSaga(sagaData);
            } catch (error) {
                console.error('Error loading saga:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSaga();
    }, [sagaId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Typography variant="h3">Loading...</Typography>
            </View>
        );
    }

    if (!saga) {
        return (
            <View style={styles.container}>
                <Typography variant="h3">Saga not found</Typography>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h1">{saga.name}</Typography>
                <View style={styles.iconContainer}>
                    <Icon name={saga.icon as any} size={20} style={styles.icon} />
                    <Typography variant="body1">Saga</Typography>
                </View>
            </View>

            <View style={styles.content}>
                <Typography variant="h3">Created</Typography>
                <Typography variant="body1">{new Date(saga.createdAt).toLocaleDateString()}</Typography>
            </View>

            {/* Saga chapters would be shown here */}
            <View style={styles.content}>
                <Typography variant="h3">Chapters</Typography>
                <Typography variant="body1">No chapters available</Typography>
            </View>
        </ScrollView>
    );
};

export default SagaDetailScreen; 