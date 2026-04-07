import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { predictionApi, horoscopeApi } from '@/services/api';
import { Branding, Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

export default function MyMarriageScreen() {
    const { colorScheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [dailyImpacts, setDailyImpacts] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState(0);

    useEffect(() => {
        fetchMarriageStatus();
        fetchDailyImpacts();
    }, []);

    const fetchMarriageStatus = async () => {
        try {
            const res = await predictionApi.getMarriageStatus();
            setData(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDailyImpacts = async () => {
        try {
            const res = await horoscopeApi.getMyDailyImpacts();
            setDailyImpacts(res);
        } catch (error) {
            console.error("Daily impact error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Branding.gold} />
                <Text style={styles.loaderText}>திருமண பொருத்தம் கணிக்கப்படுகிறது... (Calculating...)</Text>
            </View>
        );
    }

    const currentImpact = dailyImpacts[selectedDay];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#200D0D', Branding.black]} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>எனது திருமணம்</Text>
                <Text style={styles.subtitle}>My Soulmate Journey</Text>

                {/* Daily Insight Section */}
                <Text style={styles.sectionHeader}>தினசரி தாக்கம் (Daily Insight)</Text>
                <View style={styles.dailyContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
                        {dailyImpacts.map((item, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={[styles.dayItem, selectedDay === idx && styles.dayItemActive]}
                                onPress={() => setSelectedDay(idx)}
                            >
                                <Text style={[styles.dayLabel, selectedDay === idx && styles.dayLabelActive]}>
                                    {idx === 0 ? 'இன்று' : item.day_name.substring(0, 3)}
                                </Text>
                                <Text style={[styles.dateLabel, selectedDay === idx && styles.dateLabelActive]}>
                                    {item.date.split('-')[2]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {currentImpact && (
                        <View style={styles.impactCard}>
                            <View style={styles.impactHeader}>
                                <View style={[styles.indicator, { backgroundColor: currentImpact.category === 'excellent' ? '#4CAF50' : currentImpact.category === 'caution' ? '#F44336' : Branding.gold }]} />
                                <Text style={styles.taraText}>{currentImpact.tara}</Text>
                            </View>
                            <Text style={styles.impactPalan}>{currentImpact.palan}</Text>
                        </View>
                    )}
                </View>

                {/* Timing Card */}
                <View style={[styles.timingCard, { marginTop: 20 }]}>
                    <Text style={styles.timingTitle}>திருமண காலம் (Marriage Window)</Text>
                    <View style={styles.timingRow}>
                        <MaterialCommunityIcons name="calendar-heart" size={28} color={Branding.gold} />
                        <Text style={styles.timingDate}>{data?.marriage_timing || 'Calculating...'}</Text>
                    </View>
                    <Text style={styles.timingDesc}>{data?.timing_desc_ta}</Text>
                    <Text style={styles.timingDescEn}>{data?.timing_desc}</Text>
                </View>

                {/* Partner Traits */}
                <Text style={styles.sectionHeader}>துணையின் குணங்கள் (Partner Trait)</Text>
                <View style={[styles.card, styles.traitsCard]}>
                    {data?.partner_traits_ta?.map((trait: string, idx: number) => (
                        <View key={idx} style={styles.traitBadge}>
                            <Ionicons name="sparkles" size={14} color={Branding.gold} />
                            <Text style={styles.traitText}>{trait}</Text>
                        </View>
                    )) || <Text style={{color: '#777'}}>Analyzing traits...</Text>}
                </View>

                {/* Dosha & Verdict */}
                <View style={styles.statusRow}>
                    <View style={[styles.statusBox, {borderColor: data?.dosha?.includes('None') ? '#4CAF50' : '#F44336'}]}>
                        <Text style={styles.statusLabel}>தோஷம் (Dosha Status)</Text>
                        <Text style={styles.statusValue}>{data?.dosha || 'Analyzing...'}</Text>
                    </View>
                </View>

                <View style={styles.verdictCard}>
                    <LinearGradient colors={['rgba(212, 175, 55, 0.1)', 'transparent']} style={styles.verdictGlow} />
                    <MaterialCommunityIcons name="ring" size={40} color={Branding.gold} />
                    <Text style={styles.verdictTitle}>பொதுவான பலன் (Overall Verdict)</Text>
                    <Text style={styles.verdictText}>{data?.verdict_ta || 'Analyzing verdict...'}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Branding.black },
    loaderText: { color: Branding.gold, marginTop: 10, fontSize: 13 },
    scroll: { padding: 25, paddingTop: 60 },
    title: { fontSize: 32, fontWeight: 'bold', color: Branding.gold, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#AAA', textAlign: 'center', marginBottom: 35, letterSpacing: 3 },
    
    // Daily Impact Styles
    dailyContainer: { marginBottom: 30 },
    daySelector: { marginBottom: 15 },
    dayItem: { width: 60, height: 75, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'transparent' },
    dayItemActive: { backgroundColor: 'rgba(212, 175, 55, 0.2)', borderColor: Branding.gold },
    dayLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 5 },
    dayLabelActive: { color: Branding.gold, fontWeight: 'bold' },
    dateLabel: { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
    dateLabelActive: { color: '#FFF' },
    impactCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: Branding.gold },
    impactHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    indicator: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    taraText: { color: Branding.gold, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    impactPalan: { color: '#EEE', fontSize: 15, lineHeight: 24 },

    timingCard: { backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: Branding.gold, marginBottom: 30, alignItems: 'center' },
    timingTitle: { color: Branding.gold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    timingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    timingDate: { color: '#FFF', fontSize: 26, fontWeight: 'bold', marginLeft: 12 },
    timingDesc: { color: '#EEE', fontSize: 14, textAlign: 'center', lineHeight: 22 },
    timingDescEn: { color: '#777', fontSize: 12, textAlign: 'center', marginTop: 5, fontStyle: 'italic' },
    sectionHeader: { color: Branding.gold, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 25 },
    traitsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    traitBadge: { backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 5 },
    traitText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    statusRow: { marginBottom: 30 },
    statusBox: { padding: 20, borderRadius: 20, borderWidth: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    statusLabel: { color: '#AAA', fontSize: 12, marginBottom: 8 },
    statusValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    verdictCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 25, alignItems: 'center', overflow: 'hidden', marginBottom: 50 },
    verdictGlow: { ...StyleSheet.absoluteFillObject },
    verdictTitle: { color: Branding.gold, fontSize: 13, marginTop: 15, marginBottom: 10, textTransform: 'uppercase' },
    verdictText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', lineHeight: 28 },
    verdictTextEn: { color: '#AAA', fontSize: 14, textAlign: 'center', marginTop: 5 },
});
