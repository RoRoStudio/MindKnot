import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, Image, Dimensions, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Icon, IconName } from '../../../shared/components';
import { SagaCreationSheet } from '../components/SagaCreationSheet';
import AnimatedBookSaga from '../components/AnimatedBookSaga';
import { getAllSagas, createSaga } from '../hooks/useSagaService';
import { useSagas } from '../hooks/useSagas';
import { Saga } from '../../../shared/types/saga';

const { width } = Dimensions.get('window');
const SPACING = 24;
const ITEMS_PER_ROW = 2;
const ITEM_WIDTH = Math.floor((width - SPACING * (ITEMS_PER_ROW + 1)) / ITEMS_PER_ROW);
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

export default function SagaScreen() {
    const { theme, isDark } = useTheme();
    const [sagas, setSagas] = useState<Saga[]>([]);
    const [isCreationSheetVisible, setCreationSheetVisible] = useState(false);
    const [overlay, setOverlay] = useState<React.ReactNode>(null);
    const { setSelectedSaga } = useSagas();

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.l,
            paddingBottom: theme.spacing.m,
        },
        headerTitle: {
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
        },
        headerSubtitle: {
            color: theme.colors.textSecondary,
        },
        gridContainer: {
            padding: SPACING,
        },
        addItem: {
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            borderRadius: theme.shape.radius.m,
            borderWidth: 2,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
        },
        addIcon: {
            marginBottom: theme.spacing.s,
        },
        addText: {
            color: theme.colors.primary,
        },
        itemContainer: {
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            marginBottom: SPACING,
        }
    }));

    useEffect(() => {
        getAllSagas().then(setSagas).catch(console.error);
    }, []);

    const handleCreateSaga = async (newSaga: { name: string; icon: IconName }) => {
        try {
            console.log("Creating new saga:", newSaga);
            const created = await createSaga(newSaga.name, newSaga.icon);
            console.log("Saga created successfully:", created);
            if (created) {
                setSagas((prev) => [...prev, created]);
                setCreationSheetVisible(false);
            }
        } catch (error) {
            console.error("Error creating saga:", error);
            Alert.alert(
                "Error",
                "Failed to create the saga. Please try again."
            );
            // Keep the sheet open so the user can try again
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isEvenItem = index % 2 === 0;
        const marginLeft = isEvenItem ? 0 : SPACING;

        if (item.isAddButton) {
            return (
                <View style={[styles.itemContainer, { marginLeft }]}>
                    <TouchableOpacity
                        style={styles.addItem}
                        onPress={() => setCreationSheetVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="plus"
                            width={32}
                            height={32}
                            color={theme.colors.primary}
                            style={styles.addIcon}
                        />
                        <Typography variant="body2" style={styles.addText}>
                            Create Saga
                        </Typography>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={[styles.itemContainer, { marginLeft }]}>
                <AnimatedBookSaga
                    saga={item}
                    width={ITEM_WIDTH}
                    height={ITEM_HEIGHT}
                    onPress={() => setSelectedSaga(item.id)}
                    setOverlay={setOverlay}
                />
            </View>
        );
    };

    const gridData = [...sagas, { id: 'add-button', isAddButton: true }];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />
            {overlay}
            <View style={styles.header}>
                <Typography variant="h1" style={styles.headerTitle}>Your Sagas</Typography>
                <Typography variant="body1" style={styles.headerSubtitle}>
                    Your chronicles of knowledge
                </Typography>
            </View>

            <FlatList
                data={gridData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={ITEMS_PER_ROW}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={{ justifyContent: 'flex-start' }}
            />

            <SagaCreationSheet
                visible={isCreationSheetVisible}
                onClose={() => setCreationSheetVisible(false)}
                onCreate={handleCreateSaga}
            />
        </SafeAreaView>
    );
}