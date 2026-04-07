import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'onboarding/step1' };

export default function MarriageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/step1" />
      <Stack.Screen name="onboarding/step2" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
