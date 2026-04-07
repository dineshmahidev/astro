import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnimatedTabBar } from '@/components/AnimatedTabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: themeColors.tabIconSelected,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: '#000000', // Solid black for premium feel
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 213, 111, 0.1)', // Subtle gold border
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: themeColors.tabBar,
        },
        headerTintColor: '#FFFFFF',
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIconName: 'house.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="house.fill" color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily',
          tabBarIconName: 'calendar.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="calendar.fill" color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIconName: 'message.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="message.fill" color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="marriage"
        options={{
          title: 'Marriage',
          tabBarIconName: 'heart.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="advanced"
        options={{
          title: 'Premium',
          tabBarIconName: 'sparkles.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="sparkles.fill" color={color} />,
        } as any}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="predict" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
