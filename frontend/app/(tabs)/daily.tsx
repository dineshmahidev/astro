import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LucideSun, LucideZap, LucideHeart, LucideWallet, LucideDna } from 'lucide-react-native';
import { horoscopeApi } from '@/services/api';

export default function DailyScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const json = await horoscopeApi.getMyDailyImpacts();
      // The me/daily-impacts returns an array for 5 days, let's take the first one (today)
      if (Array.isArray(json)) {
        setData(json[0]);
      } else {
        setData(json);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDaily} colors={['#D4AF37']} />}
    >
      <View style={styles.header}>
        <LucideSun color="#D4AF37" size={48} />
        <Text style={styles.title}>இன்றைய ராசி பலன்</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString('ta-IN')}</Text>
      </View>

      {data ? (
        <>
          <View style={styles.palanCard}>
            <Text style={styles.categoryBadge}>{data.category.toUpperCase()}</Text>
            <Text style={styles.palanText}>{data.palan}</Text>
          </View>

          <View style={styles.actionSection}>
            <View style={[styles.actionCard, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.actionHeader}>செய்ய வேண்டியவை</Text>
              <Text style={styles.actionText}>{data.dos}</Text>
            </View>
            <View style={[styles.actionCard, { borderLeftColor: '#F43F5E' }]}>
              <Text style={styles.actionHeader}>தவிர்க்க வேண்டியவை</Text>
              <Text style={styles.actionText}>{data.donts}</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>Loading...</Text>
      )}

      <View style={styles.grid}>
        <View style={[styles.gridItem, { borderLeftColor: '#F43F5E' }]}>
          <LucideHeart color="#F43F5E" size={24} />
          <Text style={styles.gridTitle}>காதல்</Text>
          <Text style={styles.gridValue}>நல்லது</Text>
        </View>
        <View style={[styles.gridItem, { borderLeftColor: '#10B981' }]}>
          <LucideWallet color="#10B981" size={24} />
          <Text style={styles.gridTitle}>பணம்</Text>
          <Text style={styles.gridValue}>மிகவும் நன்று</Text>
        </View>
        <View style={[styles.gridItem, { borderLeftColor: '#3B82F6' }]}>
          <LucideZap color="#3B82F6" size={24} />
          <Text style={styles.gridTitle}>வேலை</Text>
          <Text style={styles.gridValue}>சாதாரணமானது</Text>
        </View>
        <View style={[styles.gridItem, { borderLeftColor: '#8B5CF6' }]}>
          <LucideDna color="#8B5CF6" size={24} />
          <Text style={styles.gridTitle}>ஆரோக்கியம்</Text>
          <Text style={styles.gridValue}>கவனம்</Text>
        </View>
      </View>

      {data && (
        <View style={styles.timeTable}>
          <Text style={styles.tableTitle}>இன்றைய சுப/அசுப நேரங்கள்</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>ராகு காலம்</Text>
            <Text style={styles.tableValue}>{data.rahu_kalam}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>எமகண்டம்</Text>
            <Text style={styles.tableValue}>{data.yama_gandam}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>சூலம் (பரிகாரம்)</Text>
            <Text style={styles.tableValue}>{data.soolam}</Text>
          </View>
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
  palanCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 24,
  },
  categoryBadge: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  palanText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  gridTitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 12,
  },
  gridValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionSection: {
    marginBottom: 24,
    gap: 15,
  },
  actionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  actionHeader: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  actionText: {
    color: '#eee',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  timeTable: {
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  tableTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tableLabel: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  tableValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
  },
});
