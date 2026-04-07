import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export const options = { headerShown: false };

export default function Step1() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Video
        source={require('@/assets/queen.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />
      <LinearGradient colors={['rgba(0,0,0,0.2)', '#0d0304']} style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.headline}>Your Marriage Journey Begins</Text>
          <Text style={styles.sub}>
            Understand your compatibility and discover when the stars align for your wedding.
          </Text>

          <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/marriage/onboarding/step2')}>
            <LinearGradient colors={['#FFD56F', '#FF9D2B']} style={styles.btnGradient}>
              <Text style={styles.nextTxt}>Discover Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0304' },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', paddingBottom: 60 },
  content: { paddingHorizontal: 30, alignItems: 'center' },
  headline: { color: '#FFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  sub: { color: '#CCC', fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  nextBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden' },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  nextTxt: { color: '#000', fontWeight: 'bold', fontSize: 18 },
});
