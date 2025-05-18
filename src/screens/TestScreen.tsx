import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AntDesign } from '@expo/vector-icons'; // For chevrons and flag icons
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/atoms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CENTER_X = SCREEN_WIDTH / 2;
const PATH_STROKE_WIDTH = 4;
const MILESTONE_SIZE = 40;

interface SubAction {
    text: string;
}

interface Action {
    id: string;
    title: string;
    expanded: boolean;
    subActions: string[];
}

interface Milestone {
    id: string;
    title: string;
    expanded: boolean;
    actions: Action[];
}

const MOCK_PATH: Milestone[] = [
    {
        id: 'm1',
        title: 'Milestone 1',
        expanded: false,
        actions: [
            {
                id: 'a1',
                title: 'Action 1',
                expanded: false,
                subActions: ['SubAction A', 'SubAction B'],
            },
            {
                id: 'a2',
                title: 'Action 2',
                expanded: false,
                subActions: ['SubAction C'],
            },
        ],
    },
    {
        id: 'm2',
        title: 'Milestone 2',
        expanded: true,
        actions: [
            {
                id: 'a3',
                title: 'Action 3',
                expanded: true,
                subActions: ['SubAction D', 'SubAction E'],
            },
            {
                id: 'a4',
                title: 'Action 4',
                expanded: false,
                subActions: [],
            },
        ],
    },
    {
        id: 'm3',
        title: 'Milestone 3',
        expanded: false,
        actions: [],
    },
];

function PathTimeline() {
    const [milestones, setMilestones] = useState<Milestone[]>(MOCK_PATH);

    const toggleMilestone = (milestoneId: string): void => {
        setMilestones((prev) =>
            prev.map((m) =>
                m.id === milestoneId ? { ...m, expanded: !m.expanded } : m
            )
        );
    };

    const toggleAction = (milestoneId: string, actionId: string): void => {
        setMilestones((prev) =>
            prev.map((m) =>
                m.id === milestoneId
                    ? {
                        ...m,
                        actions: m.actions.map((a) =>
                            a.id === actionId ? { ...a, expanded: !a.expanded } : a
                        ),
                    }
                    : m
            )
        );
    };

    // Calculate the total height needed for the path
    const calculatePathHeight = () => {
        // Base height (at least 100px per milestone)
        let totalHeight = milestones.length * 100;

        // Add additional height for expanded milestones
        milestones.forEach(milestone => {
            if (milestone.expanded) {
                // Base height for expanded section
                totalHeight += 40;

                // Add height for each action
                milestone.actions.forEach(action => {
                    totalHeight += 60; // Base height for action

                    // Add height for expanded sub-actions
                    if (action.expanded && action.subActions.length > 0) {
                        totalHeight += action.subActions.length * 30;
                    }
                });
            }
        });

        return Math.max(totalHeight, 700); // Ensure minimum height
    };

    const pathHeight = calculatePathHeight();

    // Generate the SVG path
    const generatePath = (): string => {
        let pathData = `M${CENTER_X},0 `;
        let currentY = 40; // Start after first milestone node

        milestones.forEach((milestone) => {
            if (milestone.expanded) {
                // If expanded, curve around the expanded content
                const expansionHeight = 60 + (milestone.actions.length * 70);
                pathData += `C${CENTER_X},${currentY + 30} ${CENTER_X - 40},${currentY + 60} ${CENTER_X - 40},${currentY + 90} `;
                pathData += `L${CENTER_X - 40},${currentY + expansionHeight - 60} `;
                pathData += `C${CENTER_X - 40},${currentY + expansionHeight - 30} ${CENTER_X},${currentY + expansionHeight} ${CENTER_X},${currentY + expansionHeight + 30} `;

                currentY += expansionHeight + 60;
            } else {
                // If collapsed, just continue straight down
                pathData += `L${CENTER_X},${currentY + 80} `;
                currentY += 100;
            }
        });

        // Ensure the path extends to the bottom
        pathData += `L${CENTER_X},${pathHeight}`;

        return pathData;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { minHeight: pathHeight }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <Svg style={[StyleSheet.absoluteFill]} height={pathHeight} width={SCREEN_WIDTH}>
                    <Path
                        d={generatePath()}
                        stroke="#ccc"
                        strokeWidth={PATH_STROKE_WIDTH}
                        fill="none"
                    />
                </Svg>

                <View style={styles.timelineContent}>
                    {milestones.map((milestone) => (
                        <View key={milestone.id} style={styles.milestoneContainer}>
                            <TouchableOpacity
                                style={styles.milestoneNode}
                                onPress={() => toggleMilestone(milestone.id)}
                            >
                                <AntDesign name="flag" size={20} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.milestoneHeader}
                                onPress={() => toggleMilestone(milestone.id)}
                            >
                                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                                <AntDesign
                                    name={milestone.expanded ? "up" : "down"}
                                    size={16}
                                    color="black"
                                />
                            </TouchableOpacity>

                            {milestone.expanded && (
                                <View style={styles.actionsContainer}>
                                    {milestone.actions.map((action) => (
                                        <View key={action.id} style={styles.actionCard}>
                                            <TouchableOpacity
                                                style={styles.actionHeader}
                                                onPress={() => toggleAction(milestone.id, action.id)}
                                            >
                                                <View style={styles.actionTitleRow}>
                                                    <View style={styles.checkbox} />
                                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                                </View>
                                                <AntDesign
                                                    name={action.expanded ? "up" : "down"}
                                                    size={14}
                                                    color="black"
                                                />
                                            </TouchableOpacity>

                                            {action.expanded && action.subActions.length > 0 && (
                                                <View style={styles.subActionList}>
                                                    {action.subActions.map((sub, idx) => (
                                                        <View key={idx} style={styles.subActionItem}>
                                                            <View style={styles.checkbox} />
                                                            <Text style={styles.subActionLabel}>{sub}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

export default function TestScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.screenContainer} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Path Timeline</Text>
            </View>

            <PathTimeline />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    scrollContent: {
        paddingTop: 40,
        paddingBottom: 80,
    },
    timelineContent: {
        alignItems: 'center',
    },
    milestoneContainer: {
        marginBottom: 60,
        alignItems: 'center',
        width: '100%',
    },
    milestoneNode: {
        width: MILESTONE_SIZE,
        height: MILESTONE_SIZE,
        borderRadius: MILESTONE_SIZE / 2,
        backgroundColor: '#4b6cb7',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    milestoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 16,
    },
    milestoneTitle: {
        marginRight: 8,
        fontWeight: '600',
        fontSize: 16,
    },
    actionsContainer: {
        marginTop: 16,
        width: '90%',
        maxWidth: 300,
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    actionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionTitle: {
        fontWeight: '500',
        fontSize: 15,
    },
    subActionList: {
        marginTop: 12,
        paddingLeft: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
    },
    subActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#999',
        marginRight: 10,
    },
    subActionLabel: {
        fontSize: 13,
    },
}); 