import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Button as PaperButton, type ButtonProps as PaperButtonProps } from 'react-native-paper';

interface ButtonProps extends Omit<PaperButtonProps, 'children'> {
  children: React.ReactNode;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function Button({
  children,
  fullWidth = false,
  size = 'medium',
  style,
  contentStyle,
  labelStyle,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    small: { height: 36, paddingHorizontal: 12 },
    medium: { height: 48, paddingHorizontal: 16 },
    large: { height: 60, paddingHorizontal: 24 }, // 60dp for driver actions
  };

  return (
    <PaperButton
      style={[
        fullWidth && styles.fullWidth,
        style,
      ]}
      contentStyle={[
        sizeStyles[size] as ViewStyle,
        contentStyle,
      ]}
      labelStyle={[
        size === 'large' && styles.largeLabel,
        labelStyle,
      ]}
      {...props}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  largeLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});
