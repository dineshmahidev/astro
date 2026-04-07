import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const options = { headerShown: false };

export default function MyPathScreen() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<any>(null);

  React.useEffect(() => {
    authApi.getMe().then(res => setUserData(res)).catch(e => console.log('MyPath err', e));
  }, []);

  const paths = [
    {
      id: 'future',
      title: 'My Future',
      subtitle: 'Life Predictions & Career Path',
      video: require('@/assets/wizard.mp4'),
      onPress: () => router.replace('/future/(tabs)')
    },
    {
      id: 'marriage',
      title: 'My Marriage',
      subtitle: 'Porutham & Wedding Timing',
      video: require('@/assets/queen.mp4'),
      onPress: () => router.replace('/marriage/(tabs)')
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cosmic Background Elements */}
      <View style={styles.cosmicBg} pointerEvents="none">
        <Animated.View entering={FadeInDown.delay(200).duration(2000)} style={[styles.cosmicIcon, { top: 100, left: -50 }]}>
          <Ionicons name="sunny-outline" size={300} color="rgba(212, 175, 55, 0.05)" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500).duration(2500)} style={[styles.cosmicIcon, { bottom: 50, right: -80 }]}>
          <Ionicons name="planet-outline" size={400} color="rgba(212, 175, 55, 0.08)" />
        </Animated.View>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Divine Guidance</Text>
        <Text style={[styles.headerTitle, { color: '#FFF' }]}>Your Destiny</Text>
      </View>

      <View style={styles.mainContent}>
        {paths.map((item, index) => (
          <Animated.View 
            key={item.id} 
            entering={FadeInDown.delay(300 * (index + 1)).duration(1000)}
            style={styles.cardWrapper}
          >
            <TouchableOpacity
              style={styles.choiceCard}
              activeOpacity={0.9}
              onPress={item.onPress}
            >
              <View style={styles.videoContainer}>
                <Video
                  source={item.video}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  shouldPlay
                  isMuted
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.overlay}>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                    
                    <View style={styles.exploreBtn}>
                      <Text style={styles.exploreText}>Explore Path</Text>
                      <Ionicons name="arrow-forward" size={16} color={Branding.black} />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Marriage Timing Live Box (Floating at bottom if exists) */}
      {userData?.marriage_prediction && (
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.predictionHighlight}>
          <LinearGradient
            colors={[Branding.gold + '40', 'rgba(212, 175, 55, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.highlightGradient}
          >
            <Ionicons name="sparkles" size={18} color={Branding.gold} />
            <View style={styles.highlightInfo}>
              <Text style={styles.highlightText}>
                {typeof userData.marriage_prediction === 'string' 
                  ? userData.marriage_prediction 
                  : userData.marriage_prediction.prediction}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cosmicBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  cosmicIcon: {
    position: 'absolute',
    opacity: 0.8,
  },
  header: { 
    paddingTop: 60, 
    paddingBottom: 20, 
    alignItems: 'center' 
  },
  headerSubtitle: {
    color: Branding.gold,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 20,
  },
  cardWrapper: {
    flex: 1,
  },
  choiceCard: {
    flex: 1,
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: '#111',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 25,
  },
  textContainer: {
    marginBottom: 0,
  },
  title: {
    color: Branding.gold,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    fontWeight: '600',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Branding.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 15,
    gap: 8,
  },
  exploreText: {
    color: Branding.black,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  predictionHighlight: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
  },
  highlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
});
