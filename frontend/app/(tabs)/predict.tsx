import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LucideSparkles, LucideBriefcase, LucideTrendingUp, LucideSmile } from 'lucide-react-native';

export default function PredictScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <LucideSparkles color="#D4AF37" size={48} />
        <Text style={styles.title}>வருங்கால கணிப்பு</Text>
        <Text style={styles.subtitle}>உங்கள் எதிர்காலத்தை இங்கே அறியவும்</Text>
      </View>

      <View style={styles.predictCard}>
        <LucideBriefcase color="#D4AF37" size={24} />
        <View style={styles.predictContent}>
          <Text style={styles.predictTitle}>வாழ்க்கை & பொது</Text>
          <Text style={styles.predictText}>உங்கள் ஜாதகத்தில் 9-ம் இடம் வலுவாக இருப்பதால் வாழ்வில் நல்ல முன்னேற்றம் உண்டாகும்.</Text>
        </View>
      </View>

      <View style={styles.predictCard}>
        <LucideTrendingUp color="#10B981" size={24} />
        <View style={styles.predictContent}>
          <Text style={styles.predictTitle}>தொழில் & வருவாய்</Text>
          <Text style={styles.predictText}>தற்போது நடைபெறும் குரு திசை உங்களுக்கு பொருளாதாரத்தில் வளர்ச்சியை தரும்.</Text>
        </View>
      </View>

      <View style={styles.predictCard}>
        <LucideSmile color="#3B82F6" size={24} />
        <View style={styles.predictContent}>
          <Text style={styles.predictTitle}>உடல்நலம்</Text>
          <Text style={styles.predictText}>சனி மற்றும் ராகுவின் நிலை காரணமாக உடல்நலத்தில் அவ்வப்போது கவனம் தேவை.</Text>
        </View>
      </View>
      
      <Text style={styles.footerText}>குறிப்பு: முழு கணிப்பிற்கு முதலில் உங்கள் ஜாதகத்தை கணக்கிடவும்.</Text>
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
    color: '#666',
    marginTop: 4,
  },
  predictCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  predictContent: {
    flex: 1,
    marginLeft: 16,
  },
  predictTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictText: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
    opacity: 0.8,
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
});
