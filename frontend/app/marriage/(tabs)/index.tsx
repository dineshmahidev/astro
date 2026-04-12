import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, TextInput, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { firebaseAuthApi, firebaseHoroscopeApi } from '@/services/firebase-api';
import { Branding } from '@/constants/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';
import { useI18n } from '@/hooks/use-i18n';

const { width } = Dimensions.get('window');

const MARRIAGE_SERVICES = [
    { name: 'Palmistry', img: require('@/assets/images/palm.png'), desc: 'Analyze Bond' },
    { name: 'Compatibility', img: require('@/assets/images/marriage_header.png'), desc: 'Divine Match' },
    { name: 'Divine Chat', img: require('@/assets/images/stars_bg.png'), desc: 'Consult Mai' }
];

export default function MarriageHome() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [pathIndex, setPathIndex] = useState(0);
    const [dailyImpacts, setDailyImpacts] = useState<any[]>([]);
    const { t } = useI18n();

    useFocusEffect(
        useCallback(() => {
            fetchHomeData();
        }, [])
    );

    const fetchHomeData = async () => {
        try {
            const user = await firebaseAuthApi.getMe();
            setData({
                name: (user as any)?.name || 'Astro Seeker',
                avatar_url: (user as any)?.avatar_url
            });
            const impacts: any = await firebaseHoroscopeApi.calculate({ type: 'daily' });
            setDailyImpacts([]); // Reset or handle accordingly
        } catch (error) {
            console.error('Fetch home data error:', error);
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
            <StatusBar style="light" />
            {/* 1. TOP HEADER */}
            <View style={[styles.headerRow, { paddingBottom: 10 }]}>
                <TouchableOpacity style={styles.profileBox} onPress={() => router.push('/marriage/(tabs)/account')}>
                    {data?.avatar_url ? (
                        <Image 
                            source={{ uri: data.avatar_url }} 
                            style={styles.avatarImg} 
                            contentFit="cover"
                        />
                    ) : (
                        <LinearGradient colors={['#FFDEDE', '#FF6B6B']} style={styles.avatarPlaceholder}>
                            <Ionicons name="heart" size={14} color={Branding.black} style={{ opacity: 0.1, position: 'absolute' }} />
                            <Text style={styles.avatarInitial}>{data?.name?.charAt(0) || 'A'}</Text>
                        </LinearGradient>
                    )}
                    <View style={styles.greetingBox}>
                        <Text style={styles.greetingText}>Shubh Vivaah!</Text>
                        <Text style={styles.userNameText}>{data?.name || 'Astro Seeker'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
                    <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* 2. DESTINY PATHS */}
                <View>
                    <Text style={[styles.sectionTitle, { paddingHorizontal: 25, marginBottom: 15 }]}>{t('continue_path')}</Text>
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
                            <Animated.View entering={FadeInDown.delay(300).duration(1000)} style={styles.pathCardWrapper}>
                                <TouchableOpacity style={styles.pathCard} activeOpacity={0.9} onPress={() => router.push('/future/(tabs)')}>
                                    <Image source={require('@/assets/images/wizard-pic.png')} style={styles.pathVideo} contentFit="cover" />
                                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.pathOverlay}>
                                        <View>
                                            <Text style={styles.pathTitle}>{t('my_future')}</Text>
                                            <Text style={styles.pathSubtitle}>{t('predictions_career')}</Text>
                                            <View style={styles.pathBtn}>
                                                <Text style={styles.pathBtnText}>{t('explore')}</Text>
                                                <Ionicons name="arrow-forward" size={12} color={Branding.black} />
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(500).duration(1000)} style={[styles.pathCardWrapper, { borderColor: Branding.gold, borderWidth: 2 }]}>
                                <TouchableOpacity style={styles.pathCard} activeOpacity={0.9} onPress={() => router.push('/marriage/(tabs)')}>
                                    <Image source={require('@/assets/images/angel-pic.png')} style={styles.pathVideo} contentFit="cover" />
                                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.pathOverlay}>
                                        <View>
                                            <Text style={styles.pathTitle}>{t('my_marriage')}</Text>
                                            <Text style={styles.pathSubtitle}>{t('bond_compatibility')}</Text>
                                            <View style={styles.pathBtn}>
                                                <Text style={styles.pathBtnText}>{t('explore')}</Text>
                                                <Ionicons name="arrow-forward" size={12} color={Branding.black} />
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </ScrollView>
                        <View style={styles.dotRow}>
                            {[0, 1].map((i) => (
                                <View key={i} style={[styles.dot, { backgroundColor: pathIndex === i ? Branding.gold : 'rgba(212,175,55,0.2)', width: pathIndex === i ? 20 : 8 }]} />
                            ))}
                        </View>
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
                                <Text style={styles.dayText}>இன்று</Text>
                            </View>
                            <View style={styles.taraRow}>
                                <View style={[styles.indicator, { backgroundColor: (dailyImpacts && dailyImpacts[0]?.category === 'excellent') ? '#4CAF50' : (dailyImpacts && dailyImpacts[0]?.category === 'caution') ? '#F44336' : Branding.gold }]} />
                                <Text style={styles.taraLabel}>{dailyImpacts && dailyImpacts[0]?.tara || 'SUNDARAM'}</Text>
                            </View>
                        </View>

                        <Text style={styles.palanText}>
                            {dailyImpacts && dailyImpacts[0]?.palan || '"வரப்போகும் நன்மைகளைக் கொண்டாடுங்கள். உறவுகள் இனிமையாகவும் வலுவாகவும் அமையும்."'}
                        </Text>

                        <View style={styles.tableGrid}>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, { borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }]}>
                                    <View style={styles.cellHeader}>
                                        <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                                        <Text style={[styles.cellTitle, { color: '#4CAF50' }]}>செய்ய வேண்டியவை</Text>
                                    </View>
                                    <Text style={styles.cellText}>துணையுடன் மனம்விட்டுப் பேசவும் {"\n"}நேர்மறையாக இருக்கவும்</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <View style={styles.cellHeader}>
                                        <Ionicons name="close-circle" size={12} color="#F44336" />
                                        <Text style={[styles.cellTitle, { color: '#F44336' }]}>செய்யக்கூடாதவை</Text>
                                    </View>
                                    <Text style={styles.cellText}>சந்தேகத்தைத் தவிர்க்கவும் {"\n"}கோபப்பட வேண்டாம்</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.next9DaysFullBtn}
                            onPress={() => router.push('/nine-days')}
                        >
                            <LinearGradient colors={[Branding.gold, '#B8860B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.next9Inner}>
                                <Text style={styles.next9Text}>{t('view_next_9_days')}</Text>
                                <Ionicons name="chevron-forward" size={16} color={Branding.black} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    centered: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 40 },
    
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: Branding.black,
        zIndex: 100
    },
    profileBox: { flexDirection: 'row', alignItems: 'center' },
    avatarImg: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1, borderColor: '#FF6B6B' },
    avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    greetingBox: { marginLeft: 12 },
    greetingText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500' },
    userNameText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', fontFamily: 'TamilFont' },
    notificationBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255,107,107,0.08)', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative'
    },
    notificationDot: { 
        position: 'absolute', 
        top: 10, 
        right: 12, 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: '#FF6B6B' 
    },

    searchContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        marginVertical: 15,
        gap: 12
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.1)'
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
    filterBtn: {
        width: 50,
        height: 50,
        borderRadius: 20,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center'
    },

    heroContainer: { paddingHorizontal: 20, marginVertical: 15, height: 260 },
    heroBanner: { flex: 1, justifyContent: 'flex-end', overflow: 'hidden' },
    heroGradient: { padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    heroTitle: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, lineHeight: 38 },
    heroBtn: { 
        backgroundColor: '#FFF', 
        paddingHorizontal: 25, 
        paddingVertical: 10, 
        borderRadius: 25, 
        alignSelf: 'flex-start',
        marginTop: 15
    },
    heroBtnText: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },

    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        marginTop: 25,
        marginBottom: 15
    },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },

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

    horizontalScroll: { paddingLeft: 20, paddingBottom: 15, gap: 15 },
    serviceCard: {
        width: 200,
        height: 280,
        borderRadius: 40,
        overflow: 'hidden',
        position: 'relative'
    },
    serviceImg: { width: '100%', height: '100%' },
    serviceGradient: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'space-between' },
    playIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    serviceInfo: { marginBottom: 10 },
    serviceName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    serviceDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
    
    moreCard: {
        backgroundColor: 'rgba(255,107,107,0.02)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.1)',
        marginRight: 20
    },
    moreText: { color: Branding.gold, fontSize: 16, fontWeight: 'bold', marginTop: 15 },

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
});
