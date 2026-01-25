import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SearchBar, SectionHeader, StopCard } from '@jeepneygo/ui';
import type { Stop, Route } from '@jeepneygo/core';

interface SearchViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBackPress: () => void;
  onClear: () => void;
  searchResults: Stop[];
  onStopPress: (stop: Stop) => void;
}

export function SearchView({
  searchQuery,
  onSearchChange,
  onBackPress,
  onClear,
  searchResults,
  onStopPress,
}: SearchViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchHeader, { paddingTop: insets.top + 12 }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search stops or routes..."
          showBackButton
          onBackPress={onBackPress}
          autoFocus
          onClear={onClear}
        />
      </View>

      <ScrollView style={styles.searchContent} keyboardShouldPersistTaps="handled">
        {searchQuery.length < 2 ? (
          <>
            <SectionHeader title="Recent Searches" subtitle="Your search history" />
            <View style={styles.emptyRecent}>
              <MaterialCommunityIcons name="history" size={48} color={theme.colors.outlineVariant} />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No recent searches
              </Text>
            </View>

            <SectionHeader title="Popular Stops" />
            {searchResults.slice(0, 3).map((stop) => {
              const stopWithRoute = stop as Stop & { route?: Route };
              return (
                <View key={stop.id} style={styles.searchResultItem}>
                  <StopCard
                    name={stop.name}
                    routeName={stopWithRoute.route?.name}
                    routeColor={stopWithRoute.route?.color}
                    onPress={() => onStopPress(stop)}
                  />
                </View>
              );
            })}
          </>
        ) : (
          <>
            <SectionHeader title="Results" subtitle={`${searchResults.length} stops found`} />
            {searchResults.length === 0 ? (
              <View style={styles.emptyRecent}>
                <MaterialCommunityIcons name="magnify-close" size={48} color={theme.colors.outlineVariant} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No stops found for "{searchQuery}"
                </Text>
              </View>
            ) : (
              searchResults.map((stop) => {
                const stopWithRoute = stop as Stop & { route?: Route };
                return (
                  <View key={stop.id} style={styles.searchResultItem}>
                    <StopCard
                      name={stop.name}
                      routeName={stopWithRoute.route?.name}
                      routeColor={stopWithRoute.route?.color}
                      onPress={() => onStopPress(stop)}
                    />
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContent: {
    flex: 1,
  },
  searchResultItem: {
    paddingHorizontal: 20,
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
