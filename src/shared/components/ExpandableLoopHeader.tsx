import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../app/contexts/ThemeContext';
// TODO: Re-enable when loops are implemented
// import { useLoopActions } from '../../features/loops/store/useLoopActions';
import { Icon } from './Icon';
import { ConfirmationModal } from './ConfirmationModal';
// import { Loop, LoopExecutionState, LoopActivityInstance, ActivityTemplate } from '../types/loop';

const { width: screenWidth } = Dimensions.get('window');

interface ExpandableLoopHeaderProps {
    visible: boolean;
    onOpenExecution: () => void;
}

interface TimerDisplayProps {
    durationMinutes?: number;
    elapsedSeconds: number;
    isRunning: boolean;
    theme: any;
    compact?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
    durationMinutes,
    elapsedSeconds,
    isRunning,
    theme,
    compact = false
}) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return compact ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
            : `${minutes}m ${remainingSeconds}s`;
    };

    if (!durationMinutes) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="clock" size={compact ? 12 : 16} color={theme.colors.textSecondary} />
                {!compact && <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 4 }}>No timer</Text>}
            </View>
        );
    }

    const totalSeconds = durationMinutes * 60;
    const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);
    const isOvertime = elapsedSeconds > totalSeconds;
    const overtimeSeconds = Math.max(0, elapsedSeconds - totalSeconds);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
                width: compact ? 16 : 24,
                height: compact ? 16 : 24,
                borderRadius: compact ? 8 : 12,
                backgroundColor: isOvertime ? theme.colors.warning : theme.colors.primary,
                marginRight: 4,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon
                    name={isRunning ? "circle-play" : "circle-pause"}
                    size={compact ? 8 : 12}
                    color={theme.colors.background}
                />
            </View>
            <Text style={{
                fontSize: compact ? 10 : 12,
                fontWeight: '600',
                color: isOvertime ? theme.colors.warning : theme.colors.textPrimary
            }}>
                {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(timeLeft)}
            </Text>
        </View>
    );
};

interface SubActionItemProps {
    subAction: { id: string; text: string; done: boolean };
    onToggle: (id: string) => void;
    theme: any;
}

const SubActionItem: React.FC<SubActionItemProps> = ({ subAction, onToggle, theme }) => (
    <TouchableOpacity
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
        }}
        onPress={() => onToggle(subAction.id)}
    >
        <View style={{
            width: 20,
            height: 20,
            borderRadius: theme.shape.radius.m,
            borderWidth: 2,
            borderColor: subAction.done ? theme.colors.success : theme.colors.border,
            backgroundColor: subAction.done ? theme.colors.success : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        }}>
            {subAction.done && (
                <Icon name="check" size={12} color={theme.colors.background} />
            )}
        </View>
        <Text style={{
            flex: 1,
            fontSize: 14,
            color: theme.colors.textPrimary,
            textDecorationLine: subAction.done ? 'line-through' : 'none',
            opacity: subAction.done ? 0.6 : 1,
        }}>
            {subAction.text}
        </Text>
    </TouchableOpacity>
);

export const ExpandableLoopHeader: React.FC<ExpandableLoopHeaderProps> = ({
    visible,
    onOpenExecution,
}) => {
    // TODO: Re-implement when loops are available
    // Return null until loops are implemented
    return null;
}; 