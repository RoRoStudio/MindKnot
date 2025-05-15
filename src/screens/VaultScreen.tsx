// src/screens/VaultScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { useNotes } from '../hooks/useNotes';
import { useSparks } from '../hooks/useSparks';
import { useActions } from '../hooks/useActions';
import { usePaths } from '../hooks/usePaths';
import { useLoops } from '../hooks/useLoops';
import { useNavigation } from '@react-navigation/native';
import { useBottomSheet } from '../contexts/BottomSheetContext';
import {
  NoteCard,
  SparkCard,
  ActionCard,
  PathCard,
  LoopCard
} from '../components/entries';
import { Note } from '../types/note';
import { Spark } from '../types/spark';
import { Action } from '../types/action';
import { Path } from '../types/path';
import { Loop } from '../types/loop';

// Define a union type for all entry types
type EntryType =
  | { type: 'note'; data: Note }
  | { type: 'spark'; data: Spark }
  | { type: 'action'; data: Action }
  | { type: 'path'; data: Path }
  | { type: 'loop'; data: Loop };

// Define filter options
type FilterType = 'all' | 'notes' | 'sparks' | 'actions' | 'paths' | 'loops' | 'tag';

export default function VaultScreen() {
  const navigation = useNavigation();
  const {
    showNoteForm,
    showSparkForm,
    showActionForm,
    showPathForm,
    showLoopForm
  } = useBottomSheet();

  // Use our custom hooks for each entry type
  const { notes, loadNotes } = useNotes();
  const { sparks, loadSparks } = useSparks();
  const { actions, loadActions, toggleActionDone } = useActions();
  const { paths, loadPaths } = usePaths();
  const { loops, loadLoops } = useLoops();

  // State for filtering and display
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [entries, setEntries] = useState<EntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

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
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.s,
    },
    tagFilter: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.shape.radius.s,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 4,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    tagFilterActive: {
      backgroundColor: theme.colors.primary,
    },
    tagText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    tagTextActive: {
      color: theme.colors.white,
    },
  }));

  // Load all data when the component mounts
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadNotes(),
          loadSparks(),
          loadActions(),
          loadPaths(),
          loadLoops()
        ]);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Collect all unique tags
  useEffect(() => {
    const tagSet = new Set<string>();

    // Process tags from all entry types
    notes.forEach(note => note.tags?.forEach(tag => tagSet.add(tag)));
    sparks.forEach(spark => spark.tags?.forEach(tag => tagSet.add(tag)));
    actions.forEach(action => action.tags?.forEach(tag => tagSet.add(tag)));
    paths.forEach(path => path.tags?.forEach(tag => tagSet.add(tag)));
    loops.forEach(loop => loop.tags?.forEach(tag => tagSet.add(tag)));

    setAllTags(Array.from(tagSet).sort());
  }, [notes, sparks, actions, paths, loops]);

  // Filter and combine entries when filter changes or data updates
  useEffect(() => {
    const filtered: EntryType[] = [];

    const addEntries = <T,>(type: EntryType['type'], items: T[]) => {
      items.forEach((item) => {
        filtered.push({ type, data: item } as EntryType);
      });
    };

    if (filterType === 'all' || filterType === 'notes') addEntries('note', notes);
    if (filterType === 'all' || filterType === 'sparks') addEntries('spark', sparks);
    if (filterType === 'all' || filterType === 'actions') addEntries('action', actions);
    if (filterType === 'all' || filterType === 'paths') addEntries('path', paths);
    if (filterType === 'all' || filterType === 'loops') addEntries('loop', loops);

    const finalFiltered = filterTag
      ? filtered.filter((entry) => entry.data.tags?.includes(filterTag))
      : filtered;

    finalFiltered.sort(
      (a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
    );

    setEntries(finalFiltered);
  }, [filterType, filterTag, notes, sparks, actions, paths, loops]);


  // Handle "Create" button
  const handleCreateEntry = () => {
    switch (filterType) {
      case 'notes':
        showNoteForm();
        break;
      case 'sparks':
        showSparkForm();
        break;
      case 'actions':
        showActionForm();
        break;
      case 'paths':
        showPathForm();
        break;
      case 'loops':
        showLoopForm();
        break;
      default:
        // For 'all' or other options, use the same as for 'notes'
        showNoteForm();
        break;
    }
  };

  // Render an entry based on its type
  const renderEntry = ({ item }: { item: EntryType }) => {
    switch (item.type) {
      case 'note':
        return <NoteCard note={item.data} />;
      case 'spark':
        return <SparkCard spark={item.data} />;
      case 'action':
        return (
          <ActionCard
            action={item.data}
            onToggleDone={toggleActionDone}
          />
        );
      case 'path':
        return <PathCard path={item.data} />;
      case 'loop':
        return <LoopCard loop={item.data} />;
      default:
        return null;
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Typography variant="h3" style={{ marginBottom: 16 }}>
        No Entries Found
      </Typography>
      <Typography style={{ textAlign: 'center', marginBottom: 24 }}>
        {filterType === 'all'
          ? "You haven't created any entries yet."
          : `No ${filterType} found.`}
      </Typography>
      <Button
        label={`Create ${filterType === 'all' ? 'Entry' : filterType.slice(0, -1)}`}
        leftIcon="plus"
        onPress={handleCreateEntry}
      />
    </View>
  );

  // Render tag filters
  const renderTagFilters = () => {
    if (allTags.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
      >
        {allTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagFilter,
              filterTag === tag && styles.tagFilterActive
            ]}
            onPress={() => {
              if (filterTag === tag) {
                setFilterTag(null);
              } else {
                setFilterTag(tag);
              }
            }}
          >
            <Typography
              style={[
                styles.tagText,
                filterTag === tag && styles.tagTextActive
              ]}
            >
              #{tag}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" style={styles.title}>Vault</Typography>
        <Typography variant="body1">
          Your archive of ideas, actions, and plans
        </Typography>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'all' && styles.filterButtonActive
              ]}
              onPress={() => {
                setFilterType('all');
                setFilterTag(null);
              }}
            >
              <Typography
                style={[
                  styles.filterButtonText,
                  filterType === 'all' && styles.filterButtonTextActive
                ]}
              >
                All
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'notes' && styles.filterButtonActive
              ]}
              onPress={() => {
                setFilterType('notes');
                setFilterTag(null);
              }}
            >
              <Typography
                style={[
                  styles.filterButtonText,
                  filterType === 'notes' && styles.filterButtonTextActive
                ]}
              >
                Notes
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'sparks' && styles.filterButtonActive
              ]}
              onPress={() => {
                setFilterType('sparks');
                setFilterTag(null);
              }}
            >
              <Typography
                style={[
                  styles.filterButtonText,
                  filterType === 'sparks' && styles.filterButtonTextActive
                ]}
              >
                Sparks
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'actions' && styles.filterButtonActive
              ]}
              onPress={() => {
                setFilterType('actions');
                setFilterTag(null);
              }}
            >
              <Typography
                style={[
                  styles.filterButtonText,
                  filterType === 'actions' && styles.filterButtonTextActive
                ]}
              >
                Actions
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'loops' && styles.filterButtonActive
              ]}
              onPress={() => {
                setFilterType('loops');
                setFilterTag(null);
              }}
            >
              <Typography
                style={[
                  styles.filterButtonText,
                  filterType === 'loops' && styles.filterButtonTextActive
                ]}
              >
                Loops
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'paths' && styles.filterButtonActive
              ]}
              onPress={() => {
                setFilterType('paths');
                setFilterTag(null);
              }}
            >
              <Typography
                style={[
                  styles.filterButtonText,
                  filterType === 'paths' && styles.filterButtonTextActive
                ]}
              >
                Paths
              </Typography>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Show tag filters */}
        {renderTagFilters()}
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Typography>Loading entries...</Typography>
          </View>
        ) : (
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => `${item.type}-${item.data.id}`}
            ListEmptyComponent={renderEmptyState()}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}