import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  const theme = useTheme();

  if (!text) {
    return <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
      <Text variant="bodySmall" style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>
        {text}
      </Text>
      <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    marginHorizontal: 16,
  },
});
