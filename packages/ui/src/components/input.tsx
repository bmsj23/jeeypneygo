import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { TextInput, HelperText, type TextInputProps } from 'react-native-paper';

interface InputProps extends Omit<TextInputProps, 'theme'> {
  containerStyle?: ViewStyle;
  errorMessage?: string;
}

// re-export icon for convenience
const InputIcon = TextInput.Icon;

function InputComponent({
  containerStyle,
  errorMessage,
  error,
  ...props
}: InputProps) {
  const hasError = error || !!errorMessage;

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        mode="outlined"
        outlineStyle={styles.outline}
        error={hasError}
        {...props}
      />
      {hasError && errorMessage && (
        <HelperText type="error" visible={hasError}>
          {errorMessage}
        </HelperText>
      )}
    </View>
  );
}

// attach icon to component
export const Input = Object.assign(InputComponent, { Icon: InputIcon });

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  outline: {
    borderRadius: 12,
  },
});
