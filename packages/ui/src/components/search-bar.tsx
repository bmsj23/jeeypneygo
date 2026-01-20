import React from 'react';
import { View, StyleSheet, TextInput, Pressable, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  editable?: boolean;
  onPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Where to?',
  onFocus,
  onBlur,
  onClear,
  autoFocus = false,
  showBackButton = false,
  onBackPress,
  editable = true,
  onPress,
}: SearchBarProps) {
  const theme = useTheme();

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      {showBackButton ? (
        <Pressable onPress={onBackPress} style={styles.iconButton} hitSlop={8}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </Pressable>
      ) : (
        <View style={styles.searchIcon}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[styles.input, { color: theme.colors.onSurface }]}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />

      {value.length > 0 && onClear && (
        <Pressable onPress={onClear} style={styles.iconButton} hitSlop={8}>
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </Pressable>
      )}
    </Container>
  );
}

export interface SearchBarHeroProps {
  onPress: () => void;
  subtitle?: string;
}

export function SearchBarHero({ onPress, subtitle = 'Find your jeepney' }: SearchBarHeroProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.heroContainer,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={[styles.heroIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.heroTextContainer}>
        <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>Where to?</Text>
        <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 12,
  },
  iconButton: {
    marginRight: 12,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 14,
  },
});
