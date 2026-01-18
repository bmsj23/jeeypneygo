import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import type { ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

function CardComponent({
  children,
  padding = 'medium',
  style,
  onPress,
}: CardProps) {
  const paddingStyles = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
  };

  return (
    <PaperCard mode="elevated" style={[styles.card, style]} onPress={onPress}>
      <View style={{ padding: paddingStyles[padding] }}>
        {children}
      </View>
    </PaperCard>
  );
}

// attach paper card sub-components
export const Card = Object.assign(CardComponent, {
  Content: PaperCard.Content,
  Actions: PaperCard.Actions,
  Cover: PaperCard.Cover,
  Title: PaperCard.Title,
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});
