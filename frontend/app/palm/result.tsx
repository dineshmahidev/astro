import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { getImageUrl } from '@/services/api';
import JathagamChart from '@/components/JathagamChart';
import { Colors, Branding } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const { width, height } = Dimensions.get('window');

export default function PalmResultScreen() {
    const { analysis, date, imageUrl } = useLocalSearchParams();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    
    const data = analysis ? JSON.parse(analysis as string) : null;

    if (!data) return (
        <View style={[styles.errorContainer, { backgroundColor: Branding.black }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={60} color={Branding.gold} />
            <Text style={styles.errorText}>Analysis not found</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtnError}>
                <Text style={styles.backBtnText}>Return to Scan</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLineItem = (title: string, meaning: string, icon: any, index: number) => (
        <Animated.View 
            entering={FadeInDown.delay(400 + index * 100)} 
            key={title} 
            style={styles.lineCard}
        >
            <View style={styles.lineHeader}>
                <View style={styles.iconCircle}>
                    <Ionicons name={icon} size={20} color={Branding.gold} />
                </View>
                <Text style={styles.lineTitle}>{title}</Text>
            </View>
            <Text style={styles.lineMeaning}>{meaning}</Text>
            <View style={styles.lineIndicator} />
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: Branding.black }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Immersive Image Header */}
                <View style={styles.heroSection}>
                    {imageUrl ? (
                        <Image 
                            source={{ uri: getImageUrl(imageUrl as string) }} 
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.heroImage, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialCommunityIcons name="hand-right" size={100} color="rgba(212,175,55,0.1)" />
                        </View>
                    )}
                    <LinearGradient 
                        colors={['transparent', 'rgba(0,0,0,0.5)', Branding.black]} 
                        style={styles.heroOverlay} 
                    />
                    
                    <View style={styles.navBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerInfo}>
                            <Text style={styles.mainTitle}>Destiny Report</Text>
                            <Text style={styles.subDate}>{date}</Text>
                        </View>
                        <TouchableOpacity style={styles.navBtn}>
                            <Ionicons name="share-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <Animated.View entering={FadeInUp.delay(200)} style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>VITALITY SCORE</Text>
                        <Text style={styles.scoreValue}>{Math.round((data.confidence || 0.85) * 100)}%</Text>
                    </Animated.View>
                </View>

                {/* Main Content */}
                <View style={styles.mainContainer}>
                    
                    {/* Overall Summary */}
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.summaryCard}>
                        <LinearGradient 
                            colors={['rgba(212,175,55,0.15)', 'transparent']} 
                            style={styles.summaryGradient} 
                        />
                        <View style={styles.summaryHeader}>
                            <MaterialCommunityIcons name="crystal-ball" size={24} color={Branding.gold} />
                            <Text style={styles.summaryTitle}>Path Summary • சுருக்கம்</Text>
                        </View>
                        <Text style={styles.summaryText}>{data.summary}</Text>
                    </Animated.View>

                    {/* Astrological Chart */}
                    <Text style={styles.sectionHeader}>Planetary Alignment • கிரக நிலைகள்</Text>
                    <View style={styles.chartWrapper}>
                        <JathagamChart planets={{
                            sun: 'Mesham',
                            moon: data.lifeLine?.includes('long') ? 'Meenam' : 'Rishabam',
                            jupiter: 'Simmam',
                            venus: 'Thulam',
                            lagna: 'Kanni'
                        }} />
                    </View>

                    {/* Quantified Scores */}
                    <Text style={styles.sectionHeader}>Energy Profile • ஆற்றல் நிலை</Text>
                    <View style={styles.scoresGrid}>
                        {[
                            { label: 'Health', key: 'health', icon: 'heart', color: '#FF6B6B' },
                            { label: 'Intelligence', key: 'intelligence', icon: 'bulb', color: '#4FACFE' },
                            { label: 'Relationship', key: 'relationship', icon: 'pulse', color: '#F093FB' },
                            { label: 'Success', key: 'success', icon: 'trending-up', color: '#43E97B' }
                        ].map((stat, idx) => (
                            <Animated.View 
                                entering={FadeInDown.delay(500 + idx * 100)} 
                                key={stat.key} 
                                style={styles.scoreRow}
                            >
                                <View style={styles.scoreInfo}>
                                    <View style={styles.scoreTitleGroup}>
                                        <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                                        <Text style={styles.scoreName}>{stat.label}</Text>
                                    </View>
                                    <Text style={styles.scorePercent}>{data.scores?.[stat.key] || 0}%</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View 
                                        style={[
                                            styles.progressBarFill, 
                                            { width: `${data.scores?.[stat.key] || 0}%`, backgroundColor: stat.color }
                                        ]} 
                                    />
                                </View>
                                <Text style={styles.statusText}>{data.interpretations?.[stat.key] || 'ANALYZING...'}</Text>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Detailed Lines */}
                    <Text style={styles.sectionHeader}>Palm Line Insights • ரேகை ஆய்வுகள்</Text>
                    <View style={styles.linesGrid}>
                        {renderLineItem("Life Line (ஆயுள்)", data.life, "heart", 0)}
                        {renderLineItem("Heart Line (இருதயம்)", data.heart, "pulse", 1)}
                        {renderLineItem("Head Line (புத்தி)", data.head, "bulb", 2)}
                    </View>

                    {/* Footer Warning */}
                    <View style={styles.disclaimer}>
                        <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.disclaimerText}>
                            Astrological insights are based on symbolic interpretations from the V3.0 Divine scoring engine.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/future/(tabs)' as any)}>
                        <Text style={styles.doneBtnText}>Return to Dashboard</Text>
                    </TouchableOpacity>
                    
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1 },
    heroSection: { height: height * 0.5, width: '100%', position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    navBar: { 
        position: 'absolute', 
        top: 50, 
        width: '100%', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    navBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    headerInfo: { alignItems: 'center' },
    mainTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    subDate: { color: Branding.gold, fontSize: 12, marginTop: 2 },
    scoreContainer: { 
        position: 'absolute', 
        bottom: 30, 
        left: 20, 
        backgroundColor: 'rgba(212,175,55,0.1)', 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 15,
        borderLeftWidth: 3,
        borderLeftColor: Branding.gold
    },
    scoreLabel: { color: Branding.gold, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    scoreValue: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 2 },
    mainContainer: { paddingHorizontal: 20, marginTop: -10 },
    summaryCard: { 
        backgroundColor: 'rgba(25,25,25,1)', 
        borderRadius: 25, 
        padding: 25, 
        borderWidth: 1, 
        borderColor: 'rgba(212,175,55,0.2)',
        overflow: 'hidden'
    },
    summaryGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
    summaryTitle: { color: Branding.gold, fontSize: 18, fontWeight: 'bold' },
    summaryText: { color: '#ECEDEE', fontSize: 15, lineHeight: 26, opacity: 0.9 },
    sectionHeader: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 35, marginBottom: 20 },
    scoresGrid: { gap: 20 },
    scoreRow: { 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        padding: 20, 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)' 
    },
    scoreInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    scoreTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    scoreName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', opacity: 0.8 },
    scorePercent: { color: Branding.gold, fontSize: 18, fontWeight: '900' },
    progressBarBg: { 
        height: 10, 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 5, 
        overflow: 'hidden',
        marginBottom: 10
    },
    progressBarFill: { height: '100%', borderRadius: 5 },
    statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 },
    chartWrapper: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 30, paddingVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    linesGrid: { gap: 15 },
    lineCard: { 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        padding: 20, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.05)' 
    },
    lineHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 10 },
    iconCircle: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: 'rgba(212,175,55,0.1)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    lineTitle: { color: Branding.gold, fontSize: 15, fontWeight: 'bold' },
    lineMeaning: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22 },
    lineIndicator: { 
        position: 'absolute', 
        right: 20, 
        top: 25, 
        width: 4, 
        height: 4, 
        borderRadius: 2, 
        backgroundColor: Branding.gold,
        opacity: 0.5
    },
    disclaimer: { flexDirection: 'row', gap: 10, marginTop: 40, paddingHorizontal: 10, opacity: 0.5 },
    disclaimerText: { color: '#FFF', fontSize: 11, flex: 1, lineHeight: 16 },
    doneBtn: { 
        backgroundColor: Branding.gold, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 40,
        shadowColor: Branding.gold,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10
    },
    doneBtnText: { color: Branding.black, fontSize: 16, fontWeight: 'bold' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    errorText: { color: '#FFF', fontSize: 18, marginTop: 20, opacity: 0.6 },
    backBtnError: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, backgroundColor: 'rgba(212,175,55,0.1)' },
    backBtnText: { color: Branding.gold, fontWeight: 'bold' }
});
