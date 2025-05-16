// src/screens/SagaDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { Typography, Button, Card, Icon } from '../components/common';
import { useLoops } from '../hooks/useLoops';
import { usePaths } from '../hooks/usePaths';
import { useSagas } from '../hooks/useSagas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useNotes } from '../hooks/useNotes';
import { useSparks } from '../hooks/useSparks';
import { useActions } from '../hooks/useActions';

type RootStackParamList = {
    Capture: { type: string, sagaId?: string };
    Loop: { sagaId?: string };
    Path: { sagaId?: string };
    SagaDetail: { sagaId: string };
    Main: undefined;
    ThemeInspector: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SagaDetailRouteProp = RouteProp<RootStackParamList, 'SagaDetail'>;

export default function SagaDetailScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<SagaDetailRouteProp>();
    const sagaId = route.params.sagaId;

    const { sagas } = useSagas();
    const { notes, loadNotes } = useNotes();
    const { sparks, loadSparks } = useSparks();
    const { actions, loadActions } = useActions();
    const { loops, loadLoops } = useLoops();
    const { paths, loadPaths } = usePaths();

    const [saga, setSaga] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        headerContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerIcon: {
            marginRight: theme.spacing.s,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        sectionTitle: {
            marginTop: theme.spacing.l,
            marginBottom: theme.spacing.s,
        },
        card: {
            marginBottom: theme.spacing.m,
        },
        emptyState: {
            padding: theme.spacing.m,
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.m,
        },
        emptyIcon: {
            marginBottom: theme.spacing.s,
        },
        actionButton: {
            marginBottom: theme.spacing.m,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }));

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Find the saga details
                const foundSaga = sagas.find(s => s.id === sagaId);
                if (foundSaga) {
                    setSaga(foundSaga);
                }

                // Load data
                await Promise.all([
                    loadNotes(),
                    loadSparks(),
                    loadActions(),
                    loadLoops(),
                    loadPaths()
                ]);
            } catch (error) {
                console.error('Error loading saga data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sagaId, sagas]);

    const navigateToNewNote = () => {
        navigation.navigate('Capture', { type: 'note', sagaId });
    };

    const navigateToNewSpark = () => {
        navigation.navigate('Capture', { type: 'spark', sagaId });
    };

    const navigateToNewAction = () => {
        navigation.navigate('Capture', { type: 'action', sagaId });
    };

    const navigateToNewLoop = () => {
        navigation.navigate('Loop', { sagaId });
    };

    const navigateToNewPath = () => {
        navigation.navigate('Path', { sagaId });
    };

    if (loading) {
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
                    <Typography variant="h2">Loading Saga...</Typography>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#213448" />
                </View>
            </SafeAreaView>
        );
    }

    if (!saga) {
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
                    <Typography variant="h2">Saga Not Found</Typography>
                </View>
                <View style={styles.content}>
                    <Typography>The saga you're looking for doesn't exist or has been deleted.</Typography>
                </View>
            </SafeAreaView>
        );
    }

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
                <View style={styles.headerContent}>
                    <Icon
                        name={saga.icon}
                        width={24}
                        height={24}
                        color="#213448"
                        style={styles.headerIcon}
                    />
                    <Typography variant="h2">{saga.name}</Typography>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {/* Quick Action Buttons */}
                <Typography variant="h3" style={styles.sectionTitle}>Quick Actions</Typography>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                        label="Note"
                        leftIcon="file-text"
                        onPress={navigateToNewNote}
                        style={{ flex: 1, marginRight: 8 }}
                        size="small"
                    />
                    <Button
                        label="Spark"
                        leftIcon="lightbulb"
                        onPress={navigateToNewSpark}
                        style={{ flex: 1, marginHorizontal: 4 }}
                        size="small"
                    />
                    <Button
                        label="Action"
                        leftIcon="check"
                        onPress={navigateToNewAction}
                        style={{ flex: 1, marginLeft: 8 }}
                        size="small"
                    />
                </View>

                {/* Notes Section */}
                <Typography variant="h3" style={styles.sectionTitle}>Notes</Typography>
                {notes.length > 0 ? (
                    notes
                        .slice(0, 3) // Just show the first 3
                        .map((note) => (
                            <Card key={note.id} style={styles.card}>
                                <Typography variant="h4">{note.title || 'Untitled Note'}</Typography>
                                <Typography variant="body2" numberOfLines={2}>
                                    {note.body || 'No content'}
                                </Typography>
                                <Typography variant="caption" color="secondary">
                                    {new Date(note.createdAt).toLocaleString()}
                                </Typography>
                            </Card>
                        ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon
                            name="file-text"
                            width={32}
                            height={32}
                            color="#547792"
                            style={styles.emptyIcon}
                        />
                        <Typography>No notes yet</Typography>
                        <Button
                            label="Add Note"
                            leftIcon="plus"
                            onPress={navigateToNewNote}
                            variant="secondary"
                            size="small"
                            style={{ marginTop: 8 }}
                        />
                    </View>
                )}

                {/* Sparks Section */}
                <Typography variant="h3" style={styles.sectionTitle}>Insights</Typography>
                {sparks.length > 0 ? (
                    sparks
                        .slice(0, 3) // Just show the first 3
                        .map((spark) => (
                            <Card key={spark.id} style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Icon name="lightbulb" width={16} height={16} color="#FFB800" style={{ marginRight: 4 }} />
                                    <Typography variant="h4">{spark.title || 'New Insight'}</Typography>
                                </View>
                                <Typography variant="body2" numberOfLines={2}>
                                    {spark.body || 'No content'}
                                </Typography>
                                <Typography variant="caption" color="secondary">
                                    {new Date(spark.createdAt).toLocaleString()}
                                </Typography>
                            </Card>
                        ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon
                            name="lightbulb"
                            width={32}
                            height={32}
                            color="#FFB800"
                            style={styles.emptyIcon}
                        />
                        <Typography>No insights yet</Typography>
                        <Button
                            label="Add Insight"
                            leftIcon="plus"
                            onPress={navigateToNewSpark}
                            variant="secondary"
                            size="small"
                            style={{ marginTop: 8 }}
                        />
                    </View>
                )}

                {/* Loops Section */}
                <Typography variant="h3" style={styles.sectionTitle}>Loops</Typography>
                {loops.length > 0 ? (
                    loops
                        .slice(0, 3) // Just show the first 3
                        .map((loop) => (
                            <Card key={loop.id} style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Icon name="calendar-sync" width={16} height={16} color="#547792" style={{ marginRight: 4 }} />
                                    <Typography variant="h4">{loop.title}</Typography>
                                </View>
                                <Typography variant="body2" numberOfLines={2}>
                                    {loop.description || 'No description'}
                                </Typography>
                                <Typography variant="caption" color="secondary">
                                    {`Frequency: ${JSON.parse(loop.frequency).type}`}
                                </Typography>
                            </Card>
                        ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon
                            name="calendar-sync"
                            width={32}
                            height={32}
                            color="#547792"
                            style={styles.emptyIcon}
                        />
                        <Typography>No loops yet</Typography>
                        <Button
                            label="Create Loop"
                            leftIcon="plus"
                            onPress={navigateToNewLoop}
                            variant="secondary"
                            size="small"
                            style={{ marginTop: 8 }}
                        />
                    </View>
                )}

                {/* Paths Section */}
                <Typography variant="h3" style={styles.sectionTitle}>Paths</Typography>
                {paths.length > 0 ? (
                    paths
                        .slice(0, 3) // Just show the first 3
                        .map((path) => (
                            <Card key={path.id} style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Icon name="compass" width={16} height={16} color="#27AE60" style={{ marginRight: 4 }} />
                                    <Typography variant="h4">{path.title}</Typography>
                                </View>
                                <Typography variant="body2" numberOfLines={2}>
                                    {path.description || 'No description'}
                                </Typography>
                                {path.startDate && (
                                    <Typography variant="caption" color="secondary">
                                        Started: {new Date(path.startDate).toLocaleDateString()}
                                    </Typography>
                                )}
                                {path.targetDate && (
                                    <Typography variant="caption" color="secondary">
                                        Target: {new Date(path.targetDate).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Card>
                        ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon
                            name="compass"
                            width={32}
                            height={32}
                            color="#27AE60"
                            style={styles.emptyIcon}
                        />
                        <Typography>No paths yet</Typography>
                        <Button
                            label="Create Path"
                            leftIcon="plus"
                            onPress={navigateToNewPath}
                            variant="secondary"
                            size="small"
                            style={{ marginTop: 8 }}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}