import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Branding } from '@/constants/theme';
import { authApi, predictionApi, horoscopeApi } from '@/services/api';

export default function MarriagePredictionScreen() {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dailyImpacts, setDailyImpacts] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Marriage Dashboard Data
                const marriageRes = await predictionApi.getMarriageStatus();
                setData(marriageRes.data);

                // Fetch Daily Impacts
                const dailyRes = await horoscopeApi.getMyDailyImpacts();
                setDailyImpacts(dailyRes);
            } catch (error) {
                console.error('Data fetch failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: Branding.black, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Branding.gold} />
                <Text style={{ color: Branding.gold, marginTop: 10 }}>ஜாதகம் கணிக்கப்படுகிறது...</Text>
            </View>
        );
    }

    const currentImpact = dailyImpacts[selectedDay];

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            <Stack.Screen options={{ 
                headerShown: true, 
                title: 'எனது திருமணம்',
                headerTransparent: true,
                headerTintColor: '#FFF',
                headerTitleStyle: { fontWeight: 'bold' },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={styles.container}>
                <LinearGradient
                    colors={[Branding.gold, 'transparent']}
                    style={styles.headerBg}
                />
                
                <View style={styles.content}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="heart-multiple" size={50} color={Branding.gold} />
                    </View>
                    
                    <Text style={styles.title}>திருமண யோகம்</Text>
                    <Text style={styles.subtitle}>My Soulmate Journey Insight</Text>

                    {/* Daily Insight Section */}
                    <View style={styles.dailyWrapper}>
                        <Text style={styles.sectionTitle}>தினசரி தாக்கம் (Daily Insight)</Text>
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

                    <View style={styles.reportCard}>
                        <Text style={styles.reportHeader}>திருமண காலம் • Timing</Text>
                        <View style={styles.timingRow}>
                             <Text style={styles.timingValue}>{data?.marriage_timing || 'Analyzing...'}</Text>
                        </View>
                        <Text style={styles.reportText}>
                            {data?.timing_desc_ta || 'உங்கள் ஜாதகப்படி திருமண காலம் கணிக்கப்படுகிறது.'}
                        </Text>
                        
                        <View style={styles.highlightBox}>
                            <Text style={styles.highlightTitle}>Current Verdict:</Text>
                            <Text style={styles.highlightDesc}>{data?.verdict_ta || 'Auspicious Phase'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingTop: 100 },
    headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 250, opacity: 0.15 },
    content: { padding: 25, alignItems: 'center' },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: Branding.gold },
    title: { fontSize: 28, fontWeight: '800', color: '#FFF', textAlign: 'center' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 8, textAlign: 'center', marginBottom: 30 },
    
    // Daily Wrapper
    dailyWrapper: { width: '100%', marginBottom: 30 },
    sectionTitle: { color: Branding.gold, fontSize: 16, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
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
    impactPalan: { color: '#EEE', fontSize: 14, lineHeight: 22 },

    reportCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 25, padding: 25, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    reportHeader: { color: Branding.gold, fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    timingValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    reportText: { color: '#ECEDEE', fontSize: 15, lineHeight: 24, opacity: 0.9 },
    highlightBox: { backgroundColor: 'rgba(212,175,55,0.1)', padding: 20, borderRadius: 15, marginTop: 25, borderLeftWidth: 4, borderLeftColor: Branding.gold },
    highlightTitle: { color: Branding.gold, fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    highlightDesc: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    backBtn: { width: '100%', height: 60, borderRadius: 30, backgroundColor: Branding.gold, justifyContent: 'center', alignItems: 'center', marginTop: 40, marginBottom: 50 },
    backBtnText: { color: Branding.black, fontSize: 18, fontWeight: 'bold' },
});
