import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Branding } from '@/constants/theme';
import { horoscopeApi } from '@/services/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function NineDaysScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [dailyImpacts, setDailyImpacts] = useState<any[]>([]);

    useEffect(() => {
        fetchImpacts();
    }, []);

    const fetchImpacts = async () => {
        try {
            const impacts = await horoscopeApi.getMyDailyImpacts();
            setDailyImpacts(impacts);
        } catch (error) {
            console.error('Fetch 9 days impacts error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator color={Branding.gold} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleBox}>
                    <Text style={styles.headerSubtitle}>Divine Outlook</Text>
                    <Text style={styles.headerTitle}>அடுத்த 9 நாட்கள்</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
            >
                {dailyImpacts.map((impact, index) => (
                    <Animated.View 
                        key={index}
                        entering={FadeInDown.delay(100 * index).duration(500)}
                        style={styles.impactCard}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.dayBadge}>
                                    <Text style={styles.dayText}>{index === 0 ? 'Today' : `Day ${index + 1}`}</Text>
                                </View>
                                <View style={styles.taraRow}>
                                    <View style={[styles.indicator, { backgroundColor: impact.category === 'excellent' ? '#4CAF50' : impact.category === 'caution' ? '#F44336' : Branding.gold }]} />
                                    <Text style={styles.taraLabel}>{impact.tara}</Text>
                                </View>
                            </View>

                            <Text style={styles.palanText}>{impact.palan}</Text>

                            <View style={styles.tableGrid}>
                                <View style={styles.tableRow}>
                                    <View style={[styles.tableCell, { borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }]}>
                                        <View style={styles.cellHeader}>
                                            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                                            <Text style={[styles.cellTitle, { color: '#4CAF50' }]}>Do's</Text>
                                        </View>
                                        <Text style={styles.cellText}>{impact.dos || 'Maintain focus\nStay active'}</Text>
                                    </View>
                                    <View style={styles.tableCell}>
                                        <View style={styles.cellHeader}>
                                            <Ionicons name="close-circle" size={12} color="#F44336" />
                                            <Text style={[styles.cellTitle, { color: '#F44336' }]}>Don'ts</Text>
                                        </View>
                                        <Text style={styles.cellText}>{impact.donts || 'Avoid risk\nNo arguments'}</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

import { StatusBar } from 'expo-status-bar';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderBottomWidth: 1,
        borderColor: 'rgba(212,175,55,0.1)'
    },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitleBox: { alignItems: 'center', marginTop: -5 },
    headerSubtitle: { color: Branding.gold, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 0 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', fontFamily: 'TamilFont' },
    
    scrollContent: { padding: 20, paddingTop: 10 },
    impactCard: { marginBottom: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)' },
    cardGradient: { padding: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dayBadge: { backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    dayText: { color: Branding.gold, fontSize: 12, fontWeight: '800' },
    taraRow: { flexDirection: 'row', alignItems: 'center' },
    indicator: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    taraLabel: { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    palanText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22, marginBottom: 20, fontFamily: 'TamilFont' },
    
    tableGrid: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, overflow: 'hidden' },
    tableRow: { flexDirection: 'row' },
    tableCell: { flex: 1, padding: 12 },
    cellHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
    cellTitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    cellText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 16, fontWeight: '600' },
});
