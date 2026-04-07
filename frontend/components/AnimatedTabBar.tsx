import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconSymbol } from './ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Branding } from '@/constants/theme';

const { width } = Dimensions.get('window');

/**
 * AnimatedTabBar: Professional, standard premium tab bar.
 * Clean layout with subtle gold accents to match the Astro theme.
 */
export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  // Filter visible routes
  const visibleRoutes = state.routes.filter(route => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null;
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10, height: 60 + (insets.bottom || 10) }]}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.routes.findIndex(r => r.key === route.key) === state.index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const label = options.title ?? route.name;
        const iconName = (options as any).tabBarIconName || 'house.fill';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconSymbol 
                name={iconName} 
                size={22} 
                color={isFocused ? Branding.gold : 'rgba(255, 255, 255, 0.4)'} 
              />
              {isFocused && (
                <View style={styles.activeDot} />
              )}
            </View>
            <Text style={[
              styles.label, 
              { color: isFocused ? Branding.gold : 'rgba(255, 255, 255, 0.4)' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: width,
    backgroundColor: '#000000', // Deep black for premium look
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.12)', // Very subtle gold separator
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    position: 'relative',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Branding.gold,
    position: 'absolute',
    top: -6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
