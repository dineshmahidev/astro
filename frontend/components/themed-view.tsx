import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/constants/theme';

export interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const backgroundColor = darkColor ?? Colors.dark.background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
