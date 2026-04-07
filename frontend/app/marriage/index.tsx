import { View, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export const options = { headerShown: false };

export default function MarriageScreen() {
  return (
    <View style={styles.container}>
      <Video
        source={require('@/assets/queen.mp4')}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
      />
      <View style={styles.overlay} />
      <Text style={styles.text}>Marriage Insights Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  text: { position: 'absolute', alignSelf: 'center', top: '50%', color: '#FFD56F', fontSize: 20, fontWeight: '700' },
});
