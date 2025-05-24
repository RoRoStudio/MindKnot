import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStyles } from '../../../hooks/useStyles';
import { Icon } from '../../common';
import { Loop } from '../../../types/loop';

interface LoopInterruptionModalProps {
    visible: boolean;
    currentLoop: Loop;
    newLoop: Loop;
    onContinueCurrentLoop: () => void;
    onStartNewLoop: () => void;
    onCancel: () => void;
}

export const LoopInterruptionModal: React.FC<LoopInterruptionModalProps> = ({
    visible,
    currentLoop,
    newLoop,
    onContinueCurrentLoop,
    onStartNewLoop,
    onCancel,
}) => {
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modal: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
        },
        header: {
            alignItems: 'center',
            marginBottom: 20,
        },
        warningIcon: {
            marginBottom: 12,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        loopInfo: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 12,
            padding: 16,
            marginVertical: 16,
        },
        loopLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            marginBottom: 4,
        },
        loopName: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        loopProgress: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.divider,
            marginVertical: 16,
        },
        actions: {
            gap: 12,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 8,
            gap: 8,
        },
        primaryButton: {
            backgroundColor: theme.colors.primary,
        },
        warningButton: {
            backgroundColor: theme.colors.warning,
        },
        secondaryButton: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '500',
        },
        primaryButtonText: {
            color: theme.colors.onPrimary,
        },
        warningButtonText: {
            color: theme.colors.onPrimary,
        },
        secondaryButtonText: {
            color: theme.colors.textPrimary,
        },
    }));

    const getCurrentActivityProgress = (loop: Loop) => {
        if (!loop.activities || loop.activities.length === 0) {
            return 'No activities';
        }

        const currentIndex = loop.currentActivityIndex || 0;
        const total = loop.activities.length;
        return `Activity ${currentIndex + 1} of ${total}`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Icon
                            name="circle-alert"
                            width={48}
                            height={48}
                            color={theme.colors.warning}
                            style={styles.warningIcon}
                        />
                        <Text style={styles.title}>Loop Already in Progress</Text>
                        <Text style={styles.subtitle}>
                            You have a loop currently running. Starting a new loop will reset your progress in the current one.
                        </Text>
                    </View>

                    <View style={styles.loopInfo}>
                        <Text style={styles.loopLabel}>Current Loop</Text>
                        <Text style={styles.loopName}>{currentLoop.title}</Text>
                        <Text style={styles.loopProgress}>
                            {getCurrentActivityProgress(currentLoop)}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.loopInfo}>
                        <Text style={styles.loopLabel}>New Loop</Text>
                        <Text style={styles.loopName}>{newLoop.title}</Text>
                        <Text style={styles.loopProgress}>
                            {newLoop.activities?.length || 0} activities
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={onContinueCurrentLoop}
                        >
                            <Icon name="circle-play" width={20} height={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                                Continue Current Loop
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.warningButton]}
                            onPress={onStartNewLoop}
                        >
                            <Icon name="circle-check" width={20} height={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.buttonText, styles.warningButtonText]}>
                                Start New Loop (Reset Current)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}; 