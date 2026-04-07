import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';
import { AnimatedTabBar } from '@/components/AnimatedTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MarriageTabs() {
  const { colorScheme } = useTheme();
  
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Branding.gold,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIconName: 'house.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="house.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="porutham"
        options={{
          title: 'Porutham',
          tabBarIconName: 'heart.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="heart.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIconName: 'message.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="message.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="palm"
        options={{
          title: 'Palm',
          tabBarIconName: 'hand.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="hand.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIconName: 'person.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="person.fill" size={24} color={color} />,
        } as any}
      />
    </Tabs>
  );
}
