import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { useTheme } from '../../app/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export interface ConfirmationModalProps {
    /**
     * Whether the modal is visible
     */
    visible: boolean;

    /**
     * Title text for the modal
     */
    title: string;

    /**
     * Main message/description for the modal
     */
    message: string;

    /**
     * Optional icon to display in the modal header
     */
    icon?: IconName;

    /**
     * Color of the icon and primary elements
     * @default theme.colors.primary
     */
    accentColor?: string;

    /**
     * Text for the confirm button
     * @default 'Confirm'
     */
    confirmText?: string;

    /**
     * Text for the cancel button
     * @default 'Cancel'
     */
    cancelText?: string;

    /**
     * Callback when confirm is pressed
     */
    onConfirm: () => void;

    /**
     * Callback when cancel is pressed or modal is dismissed
     */
    onCancel: () => void;

    /**
     * Whether the modal is for a destructive action
     * @default false
     */
    isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    icon,
    accentColor,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDestructive = false
}) => {
    const { theme } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    // Get the color to use for accents
    const color = accentColor || (isDestructive ? theme.colors.error : theme.colors.primary);

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: width * 0.85,
            maxWidth: 400,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            paddingTop: 24,
            paddingHorizontal: 24,
            paddingBottom: 20,
            alignItems: 'center',
            ...Platform.select({
                ios: {
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                },
                android: {
                    elevation: 5,
                },
            }),
        },
        iconContainer: {
            width: 72,
            height: 72,
            borderRadius: 36,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        contentContainer: {
            width: '100%',
            alignItems: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 12,
            textAlign: 'center',
        },
        message: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
        },
        actionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        cancelButton: {
            flex: 1,
            marginRight: 8,
        },
        confirmButton: {
            flex: 1,
            marginLeft: 8,
        },
        closeButton: {
            position: 'absolute',
            top: 16,
            right: 16,
        },
    });

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 50,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible, fadeAnim, slideAnim]);

    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            {/* Modal Header with Icon */}
                            {icon && (
                                <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
                                    <Icon name={icon} width={32} height={32} color={color} />
                                </View>
                            )}

                            {/* Modal Content */}
                            <View style={styles.contentContainer}>
                                <Text style={styles.title}>{title}</Text>
                                <Text style={styles.message}>{message}</Text>
                            </View>

                            {/* Modal Actions */}
                            <View style={styles.actionsContainer}>
                                <Button
                                    label={cancelText}
                                    variant="outline"
                                    onPress={onCancel}
                                    style={styles.cancelButton}
                                />
                                <Button
                                    label={confirmText}
                                    variant={isDestructive ? 'danger' : 'primary'}
                                    onPress={onConfirm}
                                    style={styles.confirmButton}
                                />
                            </View>

                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onCancel}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Icon name="x" width={20} height={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}; 