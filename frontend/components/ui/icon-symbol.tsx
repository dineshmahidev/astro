import { SymbolView, SymbolWeight } from 'expo-symbols';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { OpaqueColorValue, Platform, StyleProp, ViewStyle } from 'react-native';

const MAPPING: any = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'sparkles.fill': 'auto-awesome',
  'chevron.right': 'chevron-right',
  'calendar.fill': 'calendar-today',
  'heart.fill': 'favorite',
  'message.fill': 'chat',
  'brain.fill': 'psychology',
  'person.fill': 'person',
  'hand.fill': 'pan-tool',
  'star.fill': 'star',
  'sparkles.fill': 'auto-awesome',
  'magic.wand.fill': 'auto-fix-high',
};

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={name}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
      />
    );
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name] || 'help-outline'}
      style={style}
    />
  );
}
