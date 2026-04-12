import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';
import { AnimatedTabBar } from '@/components/AnimatedTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useI18n } from '@/hooks/use-i18n';

export default function FutureTabs() {
  const { colorScheme } = useTheme();
  const { t } = useI18n();
  
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
          title: t('home'),
          tabBarIconName: 'house.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="house.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="predictions"
        options={{
          title: t('predict'),
          tabBarIconName: 'magic.wand.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="magic.wand.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat'),
          tabBarIconName: 'message.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="message.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="palm"
        options={{
          title: t('palm'),
          tabBarIconName: 'hand.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="hand.fill" size={24} color={color} />,
        } as any}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('account'),
          tabBarIconName: 'person.fill',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="person.fill" size={24} color={color} />,
        } as any}
      />
    </Tabs>
  );
}
