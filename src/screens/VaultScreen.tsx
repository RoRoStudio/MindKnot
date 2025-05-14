// src/screens/VaultScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { FormSelect } from '../components/form';
import { useCaptures } from '../hooks/useCaptures';
import { useLoops } from '../hooks/useLoops';
import { usePaths } from '../hooks/usePaths';
import { useSagas } from '../hooks/useSagas';
import { CaptureSubType } from '../types/capture';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Same type definition
type RootStackParamList = {
  Capture: { type: string, sagaId?: string };
  Loop: { sagaId?: string };
  Path: { sagaId?: string };
  SagaDetail: { sagaId: string };
  Main: undefined;
  ThemeInspector: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VaultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { captures, loadCaptures } = useCaptures();
  const { loops, loadLoops } = useLoops();
  const { paths, loadPaths } = usePaths();
  const { sagas } = useSagas();

  const [contentType, setContentType] = useState('all');
  const [filteredContent, setFilteredContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { control } = useForm();

  const styles = useStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    title: {
      marginBottom: theme.spacing.s,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.s,
    },
    filterGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filterButton: {
      marginRight: theme.spacing.s,
      marginBottom: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.shape.radius.m,
      backgroundColor: theme.colors.surfaceVariant,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterButtonText: {
      color: theme.colors.textPrimary,
    },
    filterButtonTextActive: {
      color: theme.colors.white,
    },
    content: {
      flex: 1,
      padding: theme.spacing.m,
    },
    card: {
      marginBottom: theme.spacing.m,
    },
    cardContent: {
      flex: 1,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    itemIcon: {
      marginRight: theme.spacing.xs,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    tag: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.shape.radius.s,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 2,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
  }));

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        // Load all data without filtering by saga
        await Promise.all([
          loadCaptures(),
          loadLoops(),
          loadPaths(),
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    // Filter content based on selected type
    let filtered: any[] = [];

    if (contentType === 'all' || contentType === 'captures') {
      filtered = [...filtered, ...captures.map(c => ({ ...c, itemType: 'capture' }))];
    } else if (contentType === 'notes') {
      filtered = [...filtered, ...captures.filter(c => c.subType === CaptureSubType.NOTE).map(c => ({ ...c, itemType: 'capture' }))];
    } else if (contentType === 'sparks') {
      filtered = [...filtered, ...captures.filter(c => c.subType === CaptureSubType.SPARK).map(c => ({ ...c, itemType: 'capture' }))];
    } else if (contentType === 'actions') {
      filtered = [...filtered, ...captures.filter(c => c.subType === CaptureSubType.ACTION).map(c => ({ ...c, itemType: 'capture' }))];
    } else if (contentType === 'reflections') {
      filtered = [...filtered, ...captures.filter(c => c.subType === CaptureSubType.REFLECTION).map(c => ({ ...c, itemType: 'capture' }))];
    }

    if (contentType === 'all' || contentType === 'loops') {
      filtered = [...filtered, ...loops.map(l => ({ ...l, itemType: 'loop' }))];
    }

    if (contentType === 'all' || contentType === 'paths') {
      filtered = [...filtered, ...paths.map(p => ({ ...p, itemType: 'path' }))];
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredContent(filtered);
  }, [contentType, captures, loops, paths]);

  const getItemIcon = (item: any) => {
    if (item.itemType === 'capture') {
      switch (item.subType) {
        case CaptureSubType.NOTE: return 'file-text';
        case CaptureSubType.SPARK: return 'lightbulb';
        case CaptureSubType.ACTION: return 'check';
        case CaptureSubType.REFLECTION: return 'sparkles';
        default: return 'file-text';
      }
    } else if (item.itemType === 'loop') {
      return 'calendar-sync';
    } else if (item.itemType === 'path') {
      return 'compass';
    }
    return 'file-text';
  };

  const getItemColor = (item: any, themeObj: any) => {
    if (item.itemType === 'capture') {
      switch (item.subType) {
        case CaptureSubType.NOTE: return themeObj.colors.primary;
        case CaptureSubType.SPARK: return '#FFB800';
        case CaptureSubType.ACTION: return themeObj.colors.success;
        case CaptureSubType.REFLECTION: return themeObj.colors.accent;
        default: return themeObj.colors.primary;
      }
    } else if (item.itemType === 'loop') {
      return themeObj.colors.secondary;
    } else if (item.itemType === 'path') {
      return themeObj.colors.info;
    }
    return themeObj.colors.primary;
  };

  const getSagaName = (sagaId: string) => {
    const saga = sagas.find(s => s.id === sagaId);
    return saga ? saga.name : 'Unlinked';
  };

  const getItemTitle = (item: any) => {
    if (item.title) return item.title;

    if (item.itemType === 'capture') {
      switch (item.subType) {
        case CaptureSubType.NOTE: return 'Untitled Note';
        case CaptureSubType.SPARK: return 'Untitled Insight';
        case CaptureSubType.ACTION: return 'Untitled Action';
        case CaptureSubType.REFLECTION: return 'Untitled Reflection';
        default: return 'Untitled Capture';
      }
    } else if (item.itemType === 'loop') {
      return 'Untitled Loop';
    } else if (item.itemType === 'path') {
      return 'Untitled Path';
    }
    return 'Untitled Item';
  };

  const renderContent = () => {
    if (filteredContent.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="vault" width={64} height={64} color="#CCCCCC" />
          <Typography variant="h3" style={{ marginTop: 16, marginBottom: 8 }}>Your Vault is Empty</Typography>
          <Typography style={{ textAlign: 'center', marginBottom: 24 }}>
            Start creating notes, insights, loops, and paths to build your personal knowledge vault.
          </Typography>
          <Button
            label="Create Something New"
            leftIcon="plus"
            onPress={() => navigation.navigate('Capture', { type: 'note' })}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={filteredContent}
        keyExtractor={(item) => `${item.itemType}-${item.id}`}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => {
              // Navigate to detail view based on item type (to be implemented)
              console.log('View item:', item);
            }}
          >
            <View style={styles.cardContent}>
              <View style={styles.itemHeader}>
                <Icon
                  name={getItemIcon(item)}
                  width={18}
                  height={18}
                  color={getItemColor(item, theme)}
                  style={styles.itemIcon}
                />
                <Typography variant="h4">{getItemTitle(item)}</Typography>
              </View>

              {item.body && (
                <Typography variant="body2" numberOfLines={2}>
                  {item.body}
                </Typography>
              )}

              {item.description && (
                <Typography variant="body2" numberOfLines={2}>
                  {item.description}
                </Typography>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Typography variant="caption" color="secondary">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Typography>

                {item.sagaId && (
                  <Typography
                    variant="caption"
                    color="secondary"
                    onPress={() => navigation.navigate('SagaDetail', { sagaId: item.sagaId })}
                  >
                    {getSagaName(item.sagaId)}
                  </Typography>
                )}
              </View>

              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagContainer}>
                  {JSON.parse(item.tags).map((tag: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Typography variant="caption">{tag}</Typography>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card >
        )
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" style={styles.title}>Vault</Typography>
        <Typography variant="body1">Your complete archive of ideas, goals, and reflections</Typography>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, contentType === 'all' && styles.filterButtonActive]}
              onPress={() => setContentType('all')}
            >
              <Typography style={[styles.filterButtonText, contentType === 'all' && styles.filterButtonTextActive]}>
                All
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, contentType === 'notes' && styles.filterButtonActive]}
              onPress={() => setContentType('notes')}
            >
              <Typography style={[styles.filterButtonText, contentType === 'notes' && styles.filterButtonTextActive]}>
                Notes
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, contentType === 'sparks' && styles.filterButtonActive]}
              onPress={() => setContentType('sparks')}
            >
              <Typography style={[styles.filterButtonText, contentType === 'sparks' && styles.filterButtonTextActive]}>
                Insights
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, contentType === 'actions' && styles.filterButtonActive]}
              onPress={() => setContentType('actions')}
            >
              <Typography style={[styles.filterButtonText, contentType === 'actions' && styles.filterButtonTextActive]}>
                Actions
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, contentType === 'loops' && styles.filterButtonActive]}
              onPress={() => setContentType('loops')}
            >
              <Typography style={[styles.filterButtonText, contentType === 'loops' && styles.filterButtonTextActive]}>
                Loops
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, contentType === 'paths' && styles.filterButtonActive]}
              onPress={() => setContentType('paths')}
            >
              <Typography style={[styles.filterButtonText, contentType === 'paths' && styles.filterButtonTextActive]}>
                Paths
              </Typography>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}