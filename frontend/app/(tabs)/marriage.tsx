import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { LucideHeart, LucideCheckCircle, LucideXCircle, LucideShieldCheck } from 'lucide-react-native';

export default function MarriageScreen() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    setLoading(true);
    try {
      // Mocking groom/bride data for testing
      const payload = {
        groom: { nakshatra_index: 2 }, // Karthigai
        bride: { nakshatra_index: 5 }  // Thiruvathirai
      };
      
      const response = await fetch('http://10.170.48.139:8000/api/match-horoscopes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      alert('Backend connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <LucideHeart color="#F43F5E" size={48} />
        <Text style={styles.title}>திருமண பொருத்தம்</Text>
        <Text style={styles.subtitle}>கலயாண பொருத்தங்களை இங்கே சரிபார்க்கவும்</Text>
      </View>

      {!result && (
        <View style={styles.formCard}>
          <Text style={styles.label}>மாப்பிள்ளை விபரங்கள்</Text>
          <TextInput style={styles.input} placeholder="மாப்பிள்ளை பெயர்" placeholderTextColor="#666" />
          <Text style={styles.label}>பெண் விபரங்கள்</Text>
          <TextInput style={styles.input} placeholder="பெண் பெயர்" placeholderTextColor="#666" />
          
          <Pressable 
            style={({ pressed }) => [styles.matchButton, pressed && styles.matchButtonPressed]} 
            onPress={handleMatch}
            disabled={loading}
          >
            <Text style={styles.matchButtonText}>{loading ? 'பொருத்தம் சரிபார்க்கப்படுகிறது...' : 'பொருத்தம் பார்'}</Text>
          </Pressable>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scorePercent}>{result.percentage}%</Text>
            <Text style={styles.scoreText}>{result.grade}</Text>
            <Text style={styles.scorePoints}>{result.total_score} / {result.max_score} மதிப்பெண்கள்</Text>
          </View>

          <View style={styles.porthams}>
            {Object.entries(result.porthams).map(([key, p]: [string, any]) => (
              <View key={key} style={styles.porthamCard}>
                {p.matched ? <LucideCheckCircle color="#10B981" size={24} /> : <LucideXCircle color="#F43F5E" size={24} />}
                <View style={styles.porthamInfo}>
                  <Text style={[styles.porthamName, { color: p.matched ? '#10B981' : '#F43F5E' }]}>{p.name}</Text>
                  <Text style={styles.porthamDesc}>{p.description}</Text>
                </View>
                <Text style={styles.porthamScore}>{p.score} / {p.max}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.resetButton} onPress={() => setResult(null)}>
            <Text style={styles.resetText}>மீண்டும் பார்க்க</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.1)',
  },
  label: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  matchButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 56,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchButtonPressed: {
    opacity: 0.8,
  },
  matchButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 0,
  },
  scoreCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 24,
  },
  scorePercent: {
    fontSize: 48,
    fontWeight: '900',
    color: '#D4AF37',
  },
  scoreText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  scorePoints: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  porthams: {
    marginBottom: 24,
  },
  porthamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  porthamInfo: {
    flex: 1,
    marginLeft: 16,
  },
  porthamName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  porthamDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  porthamScore: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
});
