// src/components/common/FormBottomSheet.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Typography } from './Typography';
import { Button } from './Button';
import { useStyles } from '../../hooks/useStyles';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FormBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    showSubmitButton?: boolean;
    submitText?: string;
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

const FormBottomSheet: React.FC<FormBottomSheetProps> = ({
    visible,
    onClose,
    title,
    children,
    showSubmitButton = true,
    submitText = 'Submit',
    onSubmit,
    isSubmitting = false
}) => {
    // This is our workaround for the hook order issue
    const [internalVisible, setInternalVisible] = useState(false);

    // Use a delay to ensure the component doesn't rapidly mount/unmount
    useEffect(() => {
        if (visible) {
            setInternalVisible(true);
        } else {
            // Add a small delay before actually removing the component
            const timer = setTimeout(() => {
                setInternalVisible(false);
            }, 400); // Slightly longer than animation duration
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const styles = useStyles((theme) => ({
        contentContainer: {
            width: '100%',
            maxHeight: SCREEN_HEIGHT * 0.8, // Limit to 80% of screen height
        },
        scrollView: {
            maxHeight: SCREEN_HEIGHT * 0.65, // Leave room for header and buttons
        },
        header: {
            marginBottom: theme.spacing.m,
        },
        title: {
            marginBottom: theme.spacing.xs,
        },
        childrenContainer: {
            minHeight: 100, // Ensure there's at least some space for content
        },
        footer: {
            marginTop: theme.spacing.l,
            paddingBottom: theme.spacing.m,
        }
    }));

    // Now FormBottomSheet actually controls the visibility
    if (!internalVisible) return null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Typography variant="h3" style={styles.title}>{title}</Typography>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.childrenContainer}>
                        {children}
                    </View>
                </ScrollView>

                {showSubmitButton && onSubmit && (
                    <View style={styles.footer}>
                        <Button
                            label={submitText}
                            variant="primary"
                            onPress={onSubmit}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        />
                    </View>
                )}
            </View>
        </BottomSheet>
    );
};

export default FormBottomSheet;