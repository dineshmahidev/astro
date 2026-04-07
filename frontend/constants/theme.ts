import { Platform } from 'react-native';

export const Branding = {
  gold: '#D4AF37',
  lightGold: '#FFD56F',
  black: '#0A0A0A',
  white: '#FFFFFF',
  gray: '#666666',
};

export const Fonts = {
  rounded: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  tamil: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  tamilBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
};

export const Colors: any = {
  light: {
    text: '#000',
    background: '#fff',
    tint: Branding.gold,
    tabIconDefault: '#ccc',
    tabIconSelected: Branding.gold,
    card: '#f0f0f0',
    border: '#ddd',
    tabBar: '#f8f8f8',
  },
  dark: {
    text: '#fff',
    background: '#0a0a0a',
    tint: Branding.gold,
    tabIconDefault: '#ccc',
    tabIconSelected: Branding.gold,
    card: '#1a1a1a',
    border: '#333',
    tabBar: '#121212',
  },
};
