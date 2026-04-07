import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';
import { authApi, horoscopeApi } from '@/services/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { colorScheme } = useTheme();
    const [userData, setUserData] = useState<any>(null);
    const [dailyImpacts, setDailyImpacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pathIndex, setPathIndex] = useState(0);

    useEffect(() => {
        const init = async () => {
            await fetchUser();
            await fetchDailyImpacts();
        };
        init();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await authApi.getMe();
            setUserData(res);
        } catch (e) {
            console.error("Failed to fetch user", e);
        }
    };

    const fetchDailyImpacts = async () => {
        try {
            const res = await horoscopeApi.getMyDailyImpacts();
            setDailyImpacts(res);
        } catch (e) {
            console.error("Home daily impact error:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: Branding.black }]}>
                <ActivityIndicator size="large" color={Branding.gold} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Premium Header */}
            <LinearGradient colors={['#1a1a1a', Branding.black]} style={styles.header}>
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <Text style={styles.greeting}>Vanakkam, {userData?.name || 'Astro User'}! ✨</Text>
                    <View style={styles.headerSubtitleRow}>
                        <Text style={styles.headerSubtitle}>{userData?.profession || 'Astro Explorer'}</Text>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.headerSubtitle}>Today's stars are speaking</Text>
                    </View>
                </Animated.View>
                
                {/* Zodiac Card */}
                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.zodiacCard}>
                    <LinearGradient
                        colors={[Branding.gold, '#B8860B']}
                        style={styles.zodiacGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.zodiacHeader}>
                            <View>
                                <Text style={styles.zodiacLabel}>YOUR RASI</Text>
                                <Text style={styles.zodiacValue}>{userData?.rasi || 'Mesha'}</Text>
                            </View>
                            <Ionicons name="moon" size={32} color={Branding.black} />
                        </View>
                        <View style={styles.zodiacFooter}>
                            <Text style={styles.nakshatraText}>{userData?.nakshatra || 'Ashwini'} Nakshatra</Text>
                            <Text style={styles.luckyText}>Lucky Color: Gold</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </LinearGradient>

            <View style={styles.content}>
                {/* 2. DESTINY PATHS (Full Width + Snap + Dots) */}
                <Text style={styles.sectionTitle}>Continue Your Path</Text>
                
                <View>
                    <ScrollView 
                        horizontal 
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const x = e.nativeEvent.contentOffset.x;
                            setPathIndex(Math.round(x / width));
                        }}
                        scrollEventThrottle={16}
                    >
                        <Animated.View entering={FadeInDown.delay(500).duration(1000)} style={styles.pathCardWrapper}>
                            <TouchableOpacity
                                style={styles.pathCard}
                                activeOpacity={0.9}
                                onPress={() => router.push('/future/(tabs)')}
                            >
                                <Image
                                    source={require('@/assets/images/wizard-pic.png')}
                                    style={styles.pathVideo}
                                    contentFit="cover"
                                />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.pathOverlay}>
                                    <View>
                                        <Text style={styles.pathTitle}>My Future</Text>
                                        <Text style={styles.pathSubtitle}>Predictions & Career</Text>
                                        <View style={styles.pathBtn}>
                                            <Text style={styles.pathBtnText}>Explore</Text>
                                            <Ionicons name="arrow-forward" size={12} color={Branding.black} />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(700).duration(1000)} style={styles.pathCardWrapper}>
                            <TouchableOpacity
                                style={styles.pathCard}
                                activeOpacity={0.9}
                                onPress={() => router.push('/marriage/(tabs)')}
                            >
                                <Image
                                    source={require('@/assets/images/angel-pic.png')}
                                    style={styles.pathVideo}
                                    contentFit="cover"
                                />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.pathOverlay}>
                                    <View>
                                        <Text style={styles.pathTitle}>My Marriage</Text>
                                        <Text style={styles.pathSubtitle}>Bond & Compatibility</Text>
                                        <View style={styles.pathBtn}>
                                            <Text style={styles.pathBtnText}>Explore</Text>
                                            <Ionicons name="arrow-forward" size={12} color={Branding.black} />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>

                    <View style={styles.dotRow}>
                        {[0, 1].map((i) => (
                            <View 
                                key={i} 
                                style={[
                                    styles.dot, 
                                    { backgroundColor: pathIndex === i ? Branding.gold : 'rgba(212,175,55,0.2)', width: pathIndex === i ? 20 : 8 }
                                ]} 
                            />
                        ))}
                    </View>
                </View>

                {/* 3. TODAY PALAN */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.impactCard}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.dayBadge}>
                                <Text style={styles.dayText}>Today</Text>
                            </View>
                            <View style={styles.taraRow}>
                                <View style={[styles.indicator, { backgroundColor: (dailyImpacts && dailyImpacts[0]?.category === 'excellent') ? '#4CAF50' : (dailyImpacts && dailyImpacts[0]?.category === 'caution') ? '#F44336' : Branding.gold }]} />
                                <Text style={styles.taraLabel}>{dailyImpacts && dailyImpacts[0]?.tara || 'SUNDARAM'}</Text>
                            </View>
                        </View>

                        <Text style={styles.palanText}>
                            {dailyImpacts && dailyImpacts[0]?.palan || '"A day of spiritual growth and peaceful connections. Trust your inner voice."'}
                        </Text>

                        <View style={styles.tableGrid}>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, { borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }]}>
                                    <View style={styles.cellHeader}>
                                        <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                                        <Text style={[styles.cellTitle, { color: '#4CAF50' }]}>Do's</Text>
                                    </View>
                                    <Text style={styles.cellText}>Practice Meditation {"\n"}Express Gratitude</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <View style={styles.cellHeader}>
                                        <Ionicons name="close-circle" size={12} color="#F44336" />
                                        <Text style={[styles.cellTitle, { color: '#F44336' }]}>Don'ts</Text>
                                    </View>
                                    <Text style={styles.cellText}>Avoid Conflicts {"\n"}No Major Finance</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.next9DaysFullBtn}
                            onPress={() => router.push('/nine-days')}
                        >
                            <LinearGradient colors={[Branding.gold, '#B8860B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.next9Inner}>
                                <Text style={styles.next9Text}>View Next 9 Days Predictions</Text>
                                <Ionicons name="chevron-forward" size={16} color={Branding.black} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

function QuickAction({ title, icon, color, onPress, delay }: any) {
    return (
        <Animated.View entering={FadeInDown.delay(delay).springify()}>
            <TouchableOpacity onPress={onPress} style={styles.actionItem}>
                <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={28} color={color} />
                </View>
                <Text style={styles.actionLabel}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    header: { padding: 25, paddingTop: 15, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    greeting: { color: Branding.gold, fontSize: 26, fontWeight: '900', fontFamily: 'TamilFont' },
    headerSubtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', fontFamily: 'TamilFont' },
    bullet: { color: Branding.gold, marginHorizontal: 8, fontSize: 10, opacity: 0.6 },
    zodiacCard: { 
        marginTop: 25, 
        borderRadius: 30, 
        overflow: 'hidden', 
        elevation: 10, 
        shadowColor: Branding.gold, 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 20 
    },
    zodiacGradient: { padding: 25 },
    zodiacHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    zodiacLabel: { color: 'rgba(0,0,0,0.6)', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
    zodiacValue: { color: Branding.black, fontSize: 32, fontWeight: '900' },
    zodiacFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between' },
    nakshatraText: { color: Branding.black, fontWeight: '700', fontSize: 14 },
    luckyText: { color: Branding.black, opacity: 0.7, fontSize: 13, fontWeight: '600' },
    content: { paddingVertical: 25 },
    sectionTitle: { color: Branding.gold, fontSize: 20, fontWeight: '900', marginBottom: 20, letterSpacing: 0.5, paddingHorizontal: 25 },
    
    pathCardWrapper: { width: width - 50, height: 220, borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', marginHorizontal: 25 },
    pathCard: { flex: 1 },
    pathVideo: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
    pathOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 25 },
    pathTitle: { color: Branding.gold, fontSize: 24, fontWeight: '900' },
    pathSubtitle: { color: '#FFF', fontSize: 13, opacity: 0.8, marginTop: 4, fontWeight: '600' },
    pathBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Branding.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start', marginTop: 15, gap: 5 },
    pathBtnText: { color: Branding.black, fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },
    
    dotRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 15, marginBottom: 20 },
    dot: { height: 8, borderRadius: 4 },

    todayPalanContainer: { 
        backgroundColor: '#111', 
        marginHorizontal: 25, 
        borderRadius: 30, 
        padding: 25, 
        borderWidth: 1, 
        borderColor: 'rgba(212,175,55,0.15)' 
    },
    impactCard: { marginHorizontal: 20, marginTop: 25, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)' },
    cardGradient: { padding: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dayBadge: { backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    dayText: { color: Branding.gold, fontSize: 12, fontWeight: '800' },
    taraRow: { flexDirection: 'row', alignItems: 'center' },
    indicator: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    taraLabel: { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    palanText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22, marginBottom: 20, fontFamily: 'TamilFont' },
    
    tableGrid: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, overflow: 'hidden', marginBottom: 15 },
    tableRow: { flexDirection: 'row' },
    tableCell: { flex: 1, padding: 12 },
    cellHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
    cellTitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: '#4CAF50' },
    cellText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 16, fontWeight: '600' },

    next9DaysFullBtn: { marginTop: 5 },
    next9Inner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 18 },
    next9Text: { color: Branding.black, fontSize: 13, fontWeight: '900' },

    actionItem: { alignItems: 'center', width: 70 },
    actionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionLabel: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});
