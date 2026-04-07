import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SouthIndianChart from '@/components/SouthIndianChart';
import { LucideChevronLeft, LucideUser, LucideMoon, LucideStar, LucideSparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ChartView() {
  const { chartData } = useLocalSearchParams();
  const router = useRouter();

  if (!chartData) return <View style={styles.empty}><Text>Error loading data</Text></View>;

  const data = JSON.parse(chartData as string);
  console.log(data);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <LucideChevronLeft color="#fff" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>உங்கள் ஜாதகம்</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.quickInfo}>
        <View style={styles.infoCard}>
          <LucideUser color="#D4AF37" size={20} />
          <Text style={styles.infoValue}>{data.input.name}</Text>
          <Text style={styles.infoLabel}>பெயர்</Text>
        </View>
        <View style={styles.infoCard}>
          <LucideMoon color="#D4AF37" size={20} />
          <Text style={styles.infoValue}>{data.moon_rasi.name_tamil}</Text>
          <Text style={styles.infoLabel}>ராசி</Text>
        </View>
        <View style={styles.infoCard}>
          <LucideStar color="#D4AF37" size={20} />
          <Text style={styles.infoValue}>{data.nakshatra.name}</Text>
          <Text style={styles.infoLabel}>நட்சத்திரம்</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <SouthIndianChart houses={data.houses} lagna_rasi={data.lagna.index} />
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>பாவங்கள் (House Details)</Text>
        {Object.values(data.houses).map((house: any) => (
          <View key={house.house_number} style={styles.detailItem}>
            <View style={styles.houseNumBox}>
              <Text style={styles.houseNumText}>{house.house_number}</Text>
            </View>
            <View style={styles.houseContent}>
              <Text style={styles.houseNameText}>{house.house_name_tamil}</Text>
              <Text style={styles.houseGrahasText}>
                {house.grahas.length > 0 ? house.grahas.join(', ') : 'கிரகங்கள் இல்லை'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.sectionHeader}>
          <LucideSparkles color="#D4AF37" size={20} />
          <Text style={styles.sectionTitle}>திசா புக்தி (Dasha Periods)</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dashaScroll}>
          {data.dashas.map((dasha: any, idx: number) => (
            <View key={idx} style={styles.dashaChip}>
              <Text style={styles.dashaLord}>{dasha.lord}</Text>
              <Text style={styles.dashaDate}>{new Date(dasha.start_date).getFullYear()}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.sectionHeader}>
          <LucideSparkles color="#D4AF37" size={20} />
          <Text style={styles.sectionTitle}>யோகங்கள் (Yogas)</Text>
        </View>
        {data.yogas.map((yoga: any, idx: number) => (
          <View key={idx} style={styles.yogaCard}>
            <Text style={styles.yogaName}>{yoga.name}</Text>
            <Text style={styles.yogaEffect}>{yoga.effect}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: 40,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    width: (width - 48) / 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  infoLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 24,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  houseNumBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  houseNumText: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  houseContent: {
    flex: 1,
  },
  houseNameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  houseGrahasText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  yogaCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  yogaName: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yogaEffect: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    opacity: 0.8,
  },
  dashaScroll: {
    paddingBottom: 8,
  },
  dashaChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  dashaLord: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dashaDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
