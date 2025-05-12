// src/screens/SagaScreen.tsx
import React, { useState } from 'react';
import {
    View,
    FlatList,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Icon, IconName } from '../components/common/Icon';
import SagaCreationSheet from '../components/sagas/SagaCreationSheet';
import AnimatedBookSaga from '../components/sagas/AnimatedBookSaga';

// Get screen width to calculate grid item width
const { width } = Dimensions.get('window');
// Calculate item width (3 items per row with some spacing)
const SPACING = 12;
const ITEMS_PER_ROW = 3;
const ITEM_WIDTH = (width - (SPACING * (ITEMS_PER_ROW + 1))) / ITEMS_PER_ROW;
const ITEM_HEIGHT = ITEM_WIDTH * 1.4; // Slightly taller for book appearance

// Define saga type
interface Saga {
    id: string;
    name: string;
    icon: IconName;
}

// Define types for grid items
type GridItem = Saga | { id: string; isAddButton: boolean };

// Mock data for sagas
const initialSagas: Saga[] = [
    { id: '1', name: 'Personal Growth', icon: 'lightbulb' },
    { id: '2', name: 'Startup Journey', icon: 'git-branch' },
    { id: '3', name: 'Health & Fitness', icon: 'map' },
    { id: '4', name: 'Learning Piano', icon: 'sparkles' },
];

interface SagaScreenProps {
    navigation: NavigationProp<ParamListBase>;
}

export default function SagaScreen({ navigation }: SagaScreenProps) {
    const { theme, isDark } = useTheme();
    const [sagas, setSagas] = useState<Saga[]>(initialSagas);
    const [isCreationSheetVisible, setCreationSheetVisible] = useState(false);

    const styles = useStyles((theme) => ({
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
        grid: {
            padding: SPACING,
        },
        addItem: {
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            borderRadius: theme.shape.radius.m,
            borderWidth: 2,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
            margin: SPACING / 2,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
        },
        addIcon: {
            marginBottom: theme.spacing.s,
        },
        addText: {
            color: theme.colors.primary,
        }
    }));

    // Function to handle saga creation
    const handleCreateSaga = (newSaga: { name: string; icon: IconName }) => {
        // Generate a random ID (in a real app, this would be handled better)
        const newId = Date.now().toString();
        setSagas([...sagas, { id: newId, ...newSaga }]);
        setCreationSheetVisible(false);
    };

    // Function to navigate to saga details
    const navigateToSagaDetails = (sagaId: string) => {
        // In a real app, you'd navigate to a detail screen with the saga ID
        console.log(`Navigating to saga details: ${sagaId}`);
        // navigation.navigate('SagaDetails', { sagaId });
    };

    // Render a saga item or the "add new" item
    const renderItem = ({ item }: { item: GridItem }) => {
        if ('isAddButton' in item) {
            return (
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
            );
        }

        return (
            <AnimatedBookSaga
                saga={item}
                width={ITEM_WIDTH}
                height={ITEM_HEIGHT}
                onPress={() => navigateToSagaDetails(item.id)}
            />
        );
    };

    // Add the "Create New" button to the data
    const gridData: GridItem[] = [...sagas, { id: 'add-button', isAddButton: true }];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />

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
                contentContainerStyle={styles.grid}
            />

            <SagaCreationSheet
                visible={isCreationSheetVisible}
                onClose={() => setCreationSheetVisible(false)}
                onCreate={handleCreateSaga}
            />
        </SafeAreaView>
    );
}