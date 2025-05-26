/**
 * LoopDetailScreen
 * 
 * Displays detailed information about a specific loop.
 * Shows activities, execution history, and provides action buttons.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    Card,
    Icon
} from '../../../shared/components';
import { Loop, ExecutionHistory } from '../../../shared/types/loop';
import { ActivityList } from '../components/ActivityList';
import { ExecutionHistoryList } from '../components/ExecutionHistoryList';
import { LoopStats } from '../components/LoopStats';
import { useLoops } from '../hooks/useLoops';
import { ExecutionEngine } from '../services/ExecutionEngine';
import { formatDuration } from '../../../shared/utils/dateUtils';

export interface LoopDetailScreenProps {
    navigation: any;
    route: {
        params: {
            loopId: string;
        };
    };
}

export const LoopDetailScreen: React.FC<LoopDetailScreenProps> = ({
    navigation,
    route
}) => {
    const { loopId } = route.params;
    const [loop, setLoop] = useState<Loop | null>(null);
    const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentExecution, setCurrentExecution] = useState<any>(null);

    const { getLoop, deleteLoop } = useLoops();

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            padding: theme.spacing.m,
        },
        header: {
            marginBottom: theme.spacing.l,
        },
        title: {
            marginBottom: theme.spacing.s,
        },
        description: {
            marginBottom: theme.spacing.m,
        },
        metadataRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        metadataIcon: {
            marginRight: theme.spacing.s,
        },
        metadataText: {
            flex: 1,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
        },
        tag: {
            backgroundColor: theme.colors.surfaceVariant,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            marginRight: theme.spacing.s,
            marginBottom: theme.spacing.s,
        },
        tagText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.m,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.l,
        },
        actionButton: {
            flex: 1,
        },
        executionBanner: {
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.m,
        },
        executionBannerText: {
            color: theme.colors.onPrimary,
            textAlign: 'center',
        },
        emptyState: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            padding: theme.spacing.l,
        },
        deleteButton: {
            marginTop: theme.spacing.xl,
        },
    }));

    // Load loop data on screen focus
    useFocusEffect(
        useCallback(() => {
            loadLoopData();
            checkCurrentExecution();
        }, [loopId])
    );

    const loadLoopData = useCallback(async () => {
        try {
            setIsLoading(true);
            const loopData = await getLoop(loopId);
            if (loopData) {
                setLoop(loopData);
                setExecutionHistory(loopData.executionHistory || []);
            } else {
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to load loop:', error);
            Alert.alert('Error', 'Failed to load loop details');
        } finally {
            setIsLoading(false);
        }
    }, [loopId, getLoop, navigation]);

    const checkCurrentExecution = useCallback(async () => {
        try {
            const executionEngine = ExecutionEngine.getInstance();
            const execution = executionEngine.getCurrentExecution();
            setCurrentExecution(execution);
        } catch (error) {
            console.error('Failed to check current execution:', error);
        }
    }, []);

    const handleStartLoop = useCallback(async () => {
        if (!loop) return;

        try {
            const executionEngine = ExecutionEngine.getInstance();
            await executionEngine.startLoop(loop);
            navigation.navigate('LoopExecution', { loopId: loop.id });
        } catch (error) {
            console.error('Failed to start loop:', error);
            Alert.alert('Error', 'Failed to start loop. Please try again.');
        }
    }, [loop, navigation]);

    const handleEditLoop = useCallback(() => {
        if (!loop) return;
        navigation.navigate('LoopBuilder', { loopId: loop.id });
    }, [loop, navigation]);

    const handleDeleteLoop = useCallback(async () => {
        if (!loop) return;

        Alert.alert(
            'Delete Loop',
            `Are you sure you want to delete "${loop.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLoop(loop.id);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete loop. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [loop, deleteLoop, navigation]);

    const handleResumeExecution = useCallback(() => {
        if (currentExecution && currentExecution.loopId === loopId) {
            navigation.navigate('LoopExecution', { loopId });
        }
    }, [currentExecution, loopId, navigation]);

    const renderMetadata = () => {
        if (!loop) return null;

        return (
            <View>
                <View style={styles.metadataRow}>
                    <Icon name="clock" size={16} style={styles.metadataIcon} />
                    <Typography variant="body2" style={styles.metadataText}>
                        Duration: {formatDuration(loop.estimatedDuration)}
                    </Typography>
                </View>

                <View style={styles.metadataRow}>
                    <Icon name="activity" size={16} style={styles.metadataIcon} />
                    <Typography variant="body2" style={styles.metadataText}>
                        {loop.activities.length} activities
                    </Typography>
                </View>

                <View style={styles.metadataRow}>
                    <Icon name="repeat" size={16} style={styles.metadataIcon} />
                    <Typography variant="body2" style={styles.metadataText}>
                        {loop.isRepeating ? `Repeats ${loop.repeatCycles || '∞'} times` : 'Single run'}
                    </Typography>
                </View>

                <View style={styles.metadataRow}>
                    <Icon name="play-circle" size={16} style={styles.metadataIcon} />
                    <Typography variant="body2" style={styles.metadataText}>
                        Executed {loop.executionCount} times
                    </Typography>
                </View>

                {loop.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {loop.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Typography style={styles.tagText}>{tag}</Typography>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderCurrentExecution = () => {
        if (!currentExecution || currentExecution.loopId !== loopId) return null;

        return (
            <Card style={styles.executionBanner} onPress={handleResumeExecution}>
                <Typography variant="body1" style={styles.executionBannerText}>
                    This loop is currently running - Tap to resume
                </Typography>
            </Card>
        );
    };

    const renderActionButtons = () => {
        const canStart = !currentExecution || currentExecution.loopId !== loopId;

        return (
            <View style={styles.actionButtons}>
                <Button
                    variant="primary"
                    label={canStart ? "Start Loop" : "Resume"}
                    leftIcon={canStart ? "play" : "play-circle"}
                    onPress={canStart ? handleStartLoop : handleResumeExecution}
                    style={styles.actionButton}
                />
                <Button
                    variant="secondary"
                    label="Edit"
                    leftIcon="edit"
                    onPress={handleEditLoop}
                    style={styles.actionButton}
                />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Typography variant="body1" style={styles.emptyState}>
                    Loading loop details...
                </Typography>
            </View>
        );
    }

    if (!loop) {
        return (
            <View style={styles.container}>
                <Typography variant="body1" style={styles.emptyState}>
                    Loop not found
                </Typography>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {renderCurrentExecution()}

                {/* Header */}
                <View style={styles.header}>
                    <Typography variant="h1" style={styles.title}>
                        {loop.title}
                    </Typography>



                    {renderMetadata()}
                </View>

                {/* Action Buttons */}
                {renderActionButtons()}

                {/* Statistics */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>
                        Statistics
                    </Typography>
                    <LoopStats loop={loop} executionHistory={executionHistory} />
                </View>

                {/* Activities */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>
                        Activities ({loop.activities.length})
                    </Typography>
                    <ActivityList activities={loop.activities} />
                </View>

                {/* Execution History */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>
                        Execution History
                    </Typography>
                    {executionHistory.length > 0 ? (
                        <ExecutionHistoryList history={executionHistory} />
                    ) : (
                        <Typography variant="body2" style={styles.emptyState}>
                            No execution history yet. Start this loop to see your progress!
                        </Typography>
                    )}
                </View>

                {/* Delete Button */}
                <Button
                    variant="danger"
                    label="Delete Loop"
                    leftIcon="trash-2"
                    onPress={handleDeleteLoop}
                    style={styles.deleteButton}
                />
            </ScrollView>
        </View>
    );
}; 