import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Branding } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import JathagamChart from '@/components/JathagamChart';
import { LinearGradient } from 'expo-linear-gradient';

const AdvancedHoroscope = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('Dasa'); // Dasa, Varga

    useEffect(() => {
        // Mocking API call for now - this would call /api/v1/horoscope/advanced
        // In a real implementation we would fetch from the user's saved birth details
        setTimeout(() => {
            setData({
                charts: {
                    Sun: { rasi: "Mesham", navamsa: "Mesham" },
                    Moon: { rasi: "Rishabam", navamsa: "Simmam" },
                    // ... other planets
                    Lagna: { rasi: "Kumbham", navamsa: "Midhunam" }
                },
                dasa: [
                    { lord: "Jupiter", start: "2010-05-15", end: "2026-05-15", is_birth_dasa: false },
                    { lord: "Saturn", start: "2026-05-15", end: "2045-05-15" }
                ],
                papasamya: 12
            });
            setLoading(false);
        }, 1500);
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: Colors[theme].background }]}>
                <ActivityIndicator size="large" color={Branding.gold} />
                <Text style={[styles.loadingText, { color: Branding.gold }]}>Calculating Celestial Alignments...</Text>
            </View>
        );
    }

    const rasiPlanets = Object.entries(data.charts).reduce((acc, [name, info]) => {
        acc[name] = info.rasi;
        return acc;
    }, {});

    const navamsaPlanets = Object.entries(data.charts).reduce((acc, [name, info]) => {
        acc[name] = info.navamsa;
        return acc;
    }, {});

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <LinearGradient colors={[Branding.black, Colors[theme].background]} style={styles.header}>
                <Text style={styles.title}>Vedic Deep Analysis</Text>
                <Text style={styles.subtitle}>Full Shodashvarga & Dasa Insight</Text>
            </LinearGradient>

            <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>Natal & Navamsa Charts</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
                    <View style={styles.chartContainer}>
                        <JathagamChart planets={rasiPlanets} type="Rasi" star="Arudra" />
                        <Text style={styles.chartLabel}>Main Birth Chart (D1)</Text>
                    </View>
                    <View style={styles.chartContainer}>
                        <JathagamChart planets={navamsaPlanets} type="Aṃśa" star="Navamsa" />
                        <Text style={styles.chartLabel}>Navamsa Chart (D9)</Text>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.tabContainer}>
                {['Dasa', 'Points'].map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'Dasa' ? (
                <View style={styles.contentSection}>
                    {data.dasa.map((d, i) => (
                        <View key={i} style={styles.dasaCard}>
                            <View style={styles.dasaIcon}>
                                <Ionicons name="sunny" size={24} color={Branding.gold} />
                            </View>
                            <View style={styles.dasaInfo}>
                                <Text style={styles.dasaLord}>{d.lord} Maha Dasa</Text>
                                <Text style={styles.dasaDates}>{d.start} to {d.end}</Text>
                            </View>
                            {new Date() < new Date(d.end) && new Date() > new Date(d.start) && (
                                <View style={styles.activeBadge}>
                                    <Text style={styles.activeBadgeText}>CURRENT</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.contentSection}>
                   <View style={styles.pointCard}>
                        <Text style={styles.pointTitle}>Papasamya Score</Text>
                        <Text style={styles.pointValue}>{data.papasamya}</Text>
                        <Text style={styles.pointDesc}>Total malefic points from Lagna, Moon, and Venus.</Text>
                   </View>
                </View>
            )}
        </ScrollView>
    );
};

export default AdvancedHoroscope;

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, fontSize: 16, fontWeight: '500' },
    header: { padding: 40, paddingTop: 60, borderBottomWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
    title: { color: Branding.gold, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 5 },
    chartSection: { marginVertical: 20 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginLeft: 20, marginBottom: 15 },
    chartContainer: { width: Dimensions.get('window').width, alignItems: 'center' },
    chartLabel: { color: Branding.gold, fontSize: 16, fontWeight: '600', marginTop: -10 },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
    tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    activeTab: { backgroundColor: Branding.gold, borderColor: Branding.gold },
    tabText: { color: 'rgba(212, 175, 55, 0.7)', fontWeight: '600' },
    activeTabText: { color: Branding.black },
    contentSection: { paddingHorizontal: 20, paddingBottom: 40 },
    dasaCard: { 
        flexDirection: 'row', 
        backgroundColor: 'rgba(212, 175, 55, 0.05)', 
        borderRadius: 12, 
        padding: 15, 
        alignItems: 'center', 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.1)'
    },
    dasaIcon: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(212, 175, 55, 0.15)', justifyContent: 'center', alignItems: 'center' },
    dasaInfo: { flex: 1, marginLeft: 15 },
    dasaLord: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    dasaDates: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
    activeBadge: { backgroundColor: Branding.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    activeBadgeText: { color: Branding.black, fontSize: 10, fontWeight: '900' },
    pointCard: { padding: 30, backgroundColor: 'rgba(212, 175, 55, 0.05)', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
    pointTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase' },
    pointValue: { color: Branding.gold, fontSize: 64, fontWeight: '900', marginVertical: 10 },
    pointDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' }
});
