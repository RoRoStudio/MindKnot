// src/screens/VaultScreen.tsx - Update to include the tab navigator
import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from '../components/common';
import VaultTabNavigator from '../navigation/VaultTabNavigator';
import { VaultFiltersProvider } from '../contexts/VaultFiltersContext';

export default function VaultScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider
    },
    title: {
      marginBottom: theme.spacing.s
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" style={styles.title}>Vault</Typography>
        <Typography variant="body1">
          Your archive of ideas, actions, and plans
        </Typography>
      </View>

      <VaultFiltersProvider>
        <VaultTabNavigator />
      </VaultFiltersProvider>
    </SafeAreaView>
  );
}