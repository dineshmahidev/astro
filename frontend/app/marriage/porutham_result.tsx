import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Branding } from '@/constants/theme';

export default function PoruthamResult() {
    const { result, groomName, brideName } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [lang, setLang] = useState<'ta' | 'en'>('ta');
    const [printing, setPrinting] = useState(false);

    const data = result ? JSON.parse(result as string) : null;

    const rotation1 = React.useRef(new Animated.Value(0)).current;
    const rotation2 = React.useRef(new Animated.Value(0)).current;
    const fillAnim = React.useRef(new Animated.Value(0)).current;
    const [animatedScore, setAnimatedScore] = useState(0);

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(rotation1, {
                toValue: 1,
                duration: 3500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
        Animated.loop(
            Animated.timing(rotation2, {
                toValue: 1,
                duration: 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        if (data && data.data) {
            fillAnim.addListener(({ value }) => {
                setAnimatedScore(Math.round(value));
            });
            Animated.timing(fillAnim, {
                toValue: data.data.percentage,
                duration: 2500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }

        return () => {
            fillAnim.removeAllListeners();
        };
    }, []);

    const spin1 = rotation1.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });
    const spin2 = rotation2.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });
    const waterLevel1 = fillAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -148]
    });
    const waterLevel2 = fillAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -148]
    });

    if (!data || !data.data) return <Text>Error: No match data found.</Text>;
    const match = data.data;

    const exportPDF = async () => {
        try {
            setPrinting(true);
            const html = `
                <html>
                <body style="font-family: sans-serif; padding: 40px; background: #0d0304; color: #FFF;">
                    <div style="text-align: center; border: 2px solid #FFD56F; padding: 20px; border-radius: 15px;">
                        <h1 style="color: #FFD56F; margin: 0; font-size: 32px;">திருமணப் பொருத்தம்</h1>
                        <p style="color: #AAA; font-size: 14px; margin-top: 5px;">Austro Astrology Services</p>
                    </div>
                    
                    <!-- USER DETAILS SIDE BY SIDE -->
                    <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
                        <tr>
                            <!-- Groom Side -->
                            <td style="width: 50%; padding-right: 20px; vertical-align: top; border-right: 1px solid rgba(255,213,111,0.3);">
                                <h3 style="color: #FFD56F; margin-bottom: 10px; font-size: 20px;">ஆண் விவரம்</h3>
                                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #FFF;">${groomName}</div>
                                <div style="color: #CCC; font-size: 14px; line-height: 1.8;">
                                    <b>தேதி:</b> ${match.groom_details?.dob || '-'}<br>
                                    <b>நேரம்:</b> ${match.groom_details?.tob || '-'}<br>
                                    <b>ஊர்:</b> ${match.groom_details?.place || '-'}<br>
                                    <b>நட்சத்திரம்:</b> <span style="color: #FFF;">${match.groom_details?.nakshatra || '-'}</span><br>
                                    <b>ராசி:</b> <span style="color: #FFF;">${match.groom_details?.rasi || '-'}</span>
                                </div>
                            </td>
                            <!-- Bride Side -->
                            <td style="width: 50%; padding-left: 20px; vertical-align: top;">
                                <h3 style="color: #FFD56F; margin-bottom: 10px; font-size: 20px;">பெண் விவரம்</h3>
                                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #FFF;">${brideName}</div>
                                <div style="color: #CCC; font-size: 14px; line-height: 1.8;">
                                    <b>தேதி:</b> ${match.bride_details?.dob || '-'}<br>
                                    <b>நேரம்:</b> ${match.bride_details?.tob || '-'}<br>
                                    <b>ஊர்:</b> ${match.bride_details?.place || '-'}<br>
                                    <b>நட்சத்திரம்:</b> <span style="color: #FFF;">${match.bride_details?.nakshatra || '-'}</span><br>
                                    <b>ராசி:</b> <span style="color: #FFF;">${match.bride_details?.rasi || '-'}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- SCORE -->
                    <div style="margin-top: 40px; text-align: center; background: rgba(255,213,111,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,213,111,0.2);">
                        <div style="font-size: 50px; color: #FFD56F; font-weight: bold; margin: 0;">
                            ${Math.round(match.percentage)}%
                        </div>
                        <h3 style="color: #FFF; margin-top: 10px; font-size: 20px;">முடிவு: <span style="color: #FFD56F;">${match.resultLabel}</span></h3>
                    </div>

                    ${match.fatalWarningTa ? `
                    <div style="margin-top: 25px; background: rgba(244, 67, 54, 0.1); padding: 20px; border-left: 5px solid #F44336;">
                        <h3 style="color: #F44336; margin: 0 0 10px 0; font-size: 18px;">முக்கிய எச்சரிக்கை!</h3>
                        <p style="color: #FFF; margin: 0; font-size: 15px; line-height: 1.5;">${match.fatalWarningTa}</p>
                    </div>
                    ` : ''}

                    <div style="margin-top: 30px;">
                        <h3 style="color: #FFD56F; border-bottom: 1px solid rgba(255,213,111,0.3); padding-bottom: 5px;">திருமண வாழ்க்கை</h3>
                        <p style="font-size: 15px; line-height: 1.6; color: #EEE;">${match.marriageLifeTa}</p>
                    </div>

                    <div style="margin-top: 30px; page-break-before: always;">
                        <h3 style="color: #FFD56F; border-bottom: 1px solid rgba(255,213,111,0.3); padding-bottom: 10px;">10 பொருத்தம் விவரம்</h3>
                        
                        ${match.breakdown.map((f: any) => {
                            const isMatch = f.status === 'Matched';
                            const isFail = f.status === 'FAIL';
                            const statusColor = isMatch ? '#4CAF50' : isFail ? '#F44336' : '#FFD56F';
                            const statusBg = isMatch ? 'rgba(76,175,80,0.08)' : isFail ? 'rgba(244,67,54,0.08)' : 'rgba(255,213,111,0.08)';
                            const statusText = isMatch ? 'பொருத்தம் உண்டு' : isFail ? 'பொருத்தம் இல்லை' : f.status;

                            return `
                                <div style="margin-bottom: 20px; background: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 15px; border-radius: 0 10px 10px 0;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="width: 70%;">
                                                <div style="font-weight: bold; font-size: 17px; color: ${statusColor};">${f.name}</div>
                                            </td>
                                            <td style="text-align: right; width: 30%;">
                                                <div style="font-weight: bold; font-size: 14px; color: ${statusColor};">${statusText}</div>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="margin-top: 10px; font-size: 14px; color: #CCC; line-height: 1.5;">
                                        ${f.desc_ta}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert('Export Failed', 'Could not generate report');
        } finally {
            setPrinting(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0d0304' }}>
            <StatusBar backgroundColor="#FFD56F" style="dark" />
            <LinearGradient colors={['#1a1a1a', '#0d0304']} style={[styles.header, { paddingTop: 15 }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFD56F" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{lang === 'ta' ? 'பொருத்தம் பலன்' : 'Match Result'}</Text>
                    <TouchableOpacity
                        onPress={() => setLang(lang === 'ta' ? 'en' : 'ta')}
                        style={styles.langToggle}
                    >
                        <Ionicons name="language" size={20} color="#FFD56F" />
                        <Text style={styles.langToggleText}>{lang === 'ta' ? 'EN' : 'தமிழ்'}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={[styles.scoreContainer, { paddingTop: 20 }]}>
                    <Text style={styles.names}>{groomName} & {brideName}</Text>

                    <LinearGradient
                        colors={['rgba(255,213,111,0.2)', 'rgba(255,157,43,0.05)']}
                        style={styles.scoreCircleBorder}
                    >
                        <View style={styles.scoreCircle}>
                            {/* Blue Liquid Base */}
                            <LinearGradient colors={['#00c6ff', '#0072ff']} style={StyleSheet.absoluteFillObject} />
                            
                            {/* Rotating Masks to create wave surface */}
                            <Animated.View style={{
                                position: 'absolute',
                                width: 300,
                                height: 300,
                                backgroundColor: '#0d0304',
                                borderRadius: 125,
                                left: -75,
                                bottom: -15,
                                transform: [{ translateY: waterLevel1 }, { rotate: spin1 }]
                            }} />

                            <Animated.View style={{
                                position: 'absolute',
                                width: 300,
                                height: 300,
                                backgroundColor: 'rgba(13,3,4,0.7)', 
                                borderRadius: 135,
                                left: -75,
                                bottom: -10,
                                transform: [{ translateY: waterLevel2 }, { rotate: spin2 }]
                            }} />

                            {/* Percentage Number Safely on Top */}
                            <View style={{ zIndex: 10, alignItems: 'center' }}>
                                <Text style={styles.scoreText}>{animatedScore}%</Text>
                                <Text style={styles.scoreLabel}>{lang === 'ta' ? 'பொருத்தம்' : 'Compatibility'}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.summaryBox}>
                        <View style={styles.methodBadge}>
                            <MaterialCommunityIcons name="star-four-points" size={14} color={Branding.gold} />
                            <Text style={styles.methodText}>{lang === 'ta' ? 'வேத ஜோதிட ஆய்வு' : 'Vedic Astrological Analysis'}</Text>
                        </View>
                        <Text style={styles.summaryTa}>{match.tanglishSummary}</Text>
                        <Text style={styles.resultLabel}>
                            <Ionicons name="star" size={16} color="#FFD56F" /> {match.resultLabel}
                        </Text>
                        
                        {match.ishta_kala && (
                            <View style={styles.ishtaKalaBox}>
                                <MaterialCommunityIcons name="clock-sun" size={14} color="rgba(255,255,255,0.6)" />
                                <Text style={styles.ishtaKalaText}>Ishta Kala (Birth Time): {match.ishta_kala}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* USER ASTROLOGICAL DETAILS */}
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <LinearGradient
                        colors={['rgba(255,213,111,0.08)', 'rgba(255,213,111,0.01)']}
                        style={styles.detailsContainer}
                    >
                        {/* Groom Side */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Ionicons name="male" size={14} color="#FFD56F" />
                                <Text style={styles.detailTitle}>{lang === 'ta' ? 'ஆண் விவரம்' : 'Groom'}</Text>
                            </View>
                            <Text style={styles.detailName} numberOfLines={1}>{groomName}</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{lang === 'ta' ? 'நட்சத்திரம்' : 'Star'}</Text>
                                <Text style={styles.detailValue}>{match.groom_details?.nakshatra || '-'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{lang === 'ta' ? 'ராசி' : 'Sign'}</Text>
                                <Text style={styles.detailValue}>{match.groom_details?.rasi || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.detailDivider} />

                        {/* Bride Side */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Ionicons name="female" size={14} color="#FFD56F" />
                                <Text style={styles.detailTitle}>{lang === 'ta' ? 'பெண் விவரம்' : 'Bride'}</Text>
                            </View>
                            <Text style={styles.detailName} numberOfLines={1}>{brideName}</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{lang === 'ta' ? 'நட்சத்திரம்' : 'Star'}</Text>
                                <Text style={styles.detailValue}>{match.bride_details?.nakshatra || '-'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{lang === 'ta' ? 'ராசி' : 'Sign'}</Text>
                                <Text style={styles.detailValue}>{match.bride_details?.rasi || '-'}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {match.fatalWarningTa && (
                    <View style={styles.fatalWarningBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="warning" size={24} color="#F44336" />
                            <Text style={styles.fatalWarningTitle}>
                                {lang === 'ta' ? 'முக்கிய எச்சரிக்கை' : 'Crucial Warning'}
                            </Text>
                        </View>
                        <Text style={styles.fatalWarningText}>
                            {lang === 'ta' ? match.fatalWarningTa : match.fatalWarningEn}
                        </Text>
                    </View>
                )}


                <View style={styles.sectionHeader}>
                    <Ionicons name="heart" size={20} color="#FF9D2B" />
                    <Text style={styles.sectionTitle}>
                        {lang === 'ta' ? 'திருமண வாழ்க்கை' : 'After Marriage Life'}
                    </Text>
                </View>
                <View style={styles.marriageBox}>
                    <Text style={styles.marriageLifeText}>
                        {lang === 'ta' ? match.marriageLifeTa : match.marriageLifeEn}
                    </Text>
                </View>

                {/* Advanced Analysis Section */}
                {match.papasamya && (
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="shield-checkmark" size={20} color={Branding.gold} />
                            <Text style={styles.sectionTitle}>{lang === 'ta' ? 'பாவசாமியம்' : 'Papasamya Balance'}</Text>
                        </View>
                        <View style={styles.advancedCard}>
                            <View style={styles.papasamyaRow}>
                                <View style={styles.papasamyaItem}>
                                    <Text style={styles.papasamyaLabel}>Groom</Text>
                                    <Text style={styles.papasamyaValue}>{match.papasamya.groomScore}</Text>
                                </View>
                                <View style={styles.papasamyaItem}>
                                    <Text style={styles.papasamyaLabel}>Bride</Text>
                                    <Text style={styles.papasamyaValue}>{match.papasamya.brideScore}</Text>
                                </View>
                                <View style={styles.papasamyaStatus}>
                                    <Ionicons 
                                        name={match.papasamya.isBalanced ? "checkmark-circle" : "alert-circle"} 
                                        size={24} 
                                        color={match.papasamya.isBalanced ? "#4CAF50" : "#F44336"} 
                                    />
                                    <Text style={[styles.papasamyaStatusText, { color: match.papasamya.isBalanced ? "#4CAF50" : "#F44336" }]}>
                                        {match.papasamya.isBalanced ? "Balanced" : "Unbalanced"}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.advancedDesc}>{match.papasamya.description}</Text>
                        </View>
                    </View>
                )}

                {match.dasaSandhi && (
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="infinite" size={20} color={Branding.gold} />
                            <Text style={styles.sectionTitle}>{lang === 'ta' ? 'தச சந்தி' : 'Dasa Sandhi'}</Text>
                        </View>
                        <View style={styles.advancedCard}>
                             <View style={styles.dasaSandhiHeader}>
                                <Ionicons 
                                    name={match.dasaSandhi.isPresent ? "warning" : "shield"} 
                                    size={24} 
                                    color={match.dasaSandhi.isPresent ? "#F44336" : "#4CAF50"} 
                                />
                                <Text style={[styles.dasaSandhiTitle, { color: match.dasaSandhi.isPresent ? "#F44336" : "#4CAF50" }]}>
                                    {match.dasaSandhi.isPresent ? "Dasa Sandhi Present" : "Clear Passage"}
                                </Text>
                             </View>
                             <Text style={styles.advancedDesc}>{match.dasaSandhi.description}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.sectionHeader}>
                    <Ionicons name="list" size={20} color="#FFD56F" />
                    <Text style={styles.sectionTitle}>
                        {lang === 'ta' ? 'பொருத்தம் விவரம்' : 'Matching Breakdown'}
                    </Text>
                </View>

                <View style={styles.factors}>
                    {match.breakdown && match.breakdown.map((factor: any, index: number) => {
                        const isMatch = factor.status === 'Matched';
                        const isFail = factor.status === 'FAIL';
                        
                        return (
                            <LinearGradient
                                key={index}
                                colors={
                                    isMatch 
                                    ? ['rgba(76, 175, 80, 0.08)', 'rgba(76, 175, 80, 0.01)']
                                    : isFail 
                                    ? ['rgba(244, 67, 54, 0.08)', 'rgba(244, 67, 54, 0.01)']
                                    : ['rgba(255,213,111,0.08)', 'rgba(255,213,111,0.01)']
                                }
                                style={[
                                    styles.factorCard,
                                    { borderColor: isMatch ? 'rgba(76, 175, 80, 0.3)' : isFail ? 'rgba(244, 67, 54, 0.3)' : 'rgba(255,213,111,0.3)' }
                                ]}
                            >
                                <View style={styles.factorHeader}>
                                    <View style={styles.factorIconBadge}>
                                        <Ionicons
                                            name={isMatch ? 'checkmark' : isFail ? 'close' : 'remove'}
                                            size={20}
                                            color={isMatch ? '#4CAF50' : isFail ? '#F44336' : '#FFD56F'}
                                        />
                                    </View>
                                    <View style={styles.factorTitles}>
                                        <Text style={styles.factorName}>{factor.name}</Text>
                                        <Text style={[
                                            styles.factorStatus,
                                            { color: isMatch ? '#4CAF50' : isFail ? '#F44336' : '#FFD56F' }
                                        ]}>
                                            {isMatch ? (lang === 'ta' ? 'பொருத்தம் உண்டு' : 'Match Found') : isFail ? (lang === 'ta' ? 'பொருத்தம் இல்லை' : 'No Match') : factor.status}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.divider, { backgroundColor: isMatch ? 'rgba(76,175,80,0.1)' : isFail ? 'rgba(244,67,54,0.1)' : 'rgba(255,213,111,0.1)' }]} />
                                <View style={styles.descWrapper}>
                                    <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.3)" style={{ marginTop: 2 }} />
                                    <Text style={styles.factorDesc}>
                                        {lang === 'ta' ? factor.desc_ta : factor.desc_en}
                                    </Text>
                                </View>
                            </LinearGradient>
                        );
                    })}
                </View>

                {/* ADVANCED PDF EXPORT BUTTON */}
                <View style={{ marginHorizontal: 20, marginTop: 15, marginBottom: 15 }}>
                    <TouchableOpacity onPress={exportPDF} disabled={printing} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#FFD56F', '#D4AF37']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.premiumExportBtn}
                        >
                            {printing ? (
                                <ActivityIndicator color="#0d0304" size="small" />
                            ) : (
                                <>
                                    <View style={styles.pdfIconWrapper}>
                                        <Ionicons name="document-text" size={16} color="#FFD56F" />
                                    </View>
                                    <Text style={styles.premiumExportText}>
                                        {lang === 'ta' ? 'முழு ஜாதகம் (PDF)' : 'Download Full PDF Report'}
                                    </Text>
                                    <Ionicons name="download-outline" size={20} color="#0d0304" style={{ marginLeft: 'auto' }} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0304' },
    header: { paddingHorizontal: 20, paddingBottom: 10 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,213,111,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFD56F', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
    langToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,213,111,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,213,111,0.3)' },
    langToggleText: { color: '#FFD56F', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
    scoreContainer: { alignItems: 'center', padding: 25, paddingTop: 0 },
    names: { color: '#FFF', fontSize: 22, marginBottom: 15, fontWeight: 'bold' },
    scoreCircleBorder: { width: 164, height: 164, borderRadius: 82, padding: 8, shadowColor: '#FFD56F', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
    scoreCircle: { flex: 1, borderRadius: 74, backgroundColor: '#0d0304', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,213,111,0.3)', overflow: 'hidden' },
    scoreText: { color: '#FFF', fontSize: 50, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    summaryBox: { marginTop: 15, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 20, width: '100%', borderWidth: 1, borderColor: 'rgba(255,213,111,0.1)' },
    summaryTa: { color: '#FFF', fontSize: 17, textAlign: 'center', fontWeight: '500', lineHeight: 24 },
    resultLabel: { color: '#FFD56F', fontSize: 18, marginTop: 12, fontWeight: 'bold' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 5, marginBottom: 10 },
    sectionTitle: { color: '#FFD56F', fontSize: 17, fontWeight: 'bold', marginLeft: 12 },
    marriageBox: { marginHorizontal: 20, padding: 20, backgroundColor: 'rgba(255,157,43,0.08)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,157,43,0.3)' },
    marriageLifeText: { color: '#FFF', fontSize: 15, lineHeight: 24, opacity: 0.9 },
    factors: { paddingHorizontal: 20 },
    factorCard: { borderRadius: 22, padding: 22, marginBottom: 18, borderWidth: 1 },
    factorHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    factorIconBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    factorTitles: { flex: 1 },
    factorName: { color: '#FFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
    factorStatus: { fontSize: 13, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
    divider: { height: 1, marginVertical: 15 },
    descWrapper: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    factorDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22, flex: 1 },
    premiumExportBtn: { height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 14, width: '100%', shadowColor: '#FFD56F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    premiumExportText: { color: '#0d0304', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.3 },
    pdfIconWrapper: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#0d0304', justifyContent: 'center', alignItems: 'center' },
    sectionContainer: { marginTop: 20 },
    advancedCard: { marginHorizontal: 20, padding: 20, backgroundColor: 'rgba(212, 175, 55, 0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
    papasamyaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
    papasamyaItem: { alignItems: 'center' },
    papasamyaLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase' },
    papasamyaValue: { color: Branding.gold, fontSize: 28, fontWeight: '900' },
    papasamyaStatus: { alignItems: 'center' },
    papasamyaStatusText: { fontSize: 12, fontWeight: '700', marginTop: 4 },
    advancedDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22 },
    dasaSandhiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    dasaSandhiTitle: { fontSize: 18, fontWeight: 'bold' },
    methodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 0.5,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    methodText: {
        color: Branding.gold,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    ishtaKalaBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        width: '100%',
        justifyContent: 'center',
    },
    ishtaKalaText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginLeft: 8,
        fontStyle: 'italic',
    },
    detailsContainer: { flexDirection: 'row', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,213,111,0.2)' },
    detailCard: { flex: 1, paddingHorizontal: 5 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
    detailTitle: { color: '#FFD56F', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    detailName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
    detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
    detailValue: { color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: '600' },
    detailDivider: { width: 1, backgroundColor: 'rgba(255,213,111,0.2)', marginHorizontal: 12 },
    fatalWarningBox: { marginHorizontal: 20, padding: 20, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(244, 67, 54, 0.4)', marginTop: 10, marginBottom: 10 },
    fatalWarningTitle: { color: '#F44336', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    fatalWarningText: { color: '#FFF', fontSize: 15, lineHeight: 24, opacity: 0.95 },
});
