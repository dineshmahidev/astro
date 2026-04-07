import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors, Fonts } from '@/constants/theme';
import { authApi, horoscopeApi, apiRequest } from '@/services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PredictionsScreen() {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    const [activeTab, setActiveTab] = useState<'timeline' | 'dasha'>('dasha');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [dashaList, setDashaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState<any>(null);
    const [detailedReport, setDetailedReport] = useState('');
    const [loadingDetail, setLoadingDetail] = useState(false);

    const scrollViewRef = React.useRef<ScrollView>(null);
    const itemLayouts = React.useRef<Record<number, number>>({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && activeTab === 'dasha' && dashaList.length > 0) {
            // Find current phase index
            const currentIdx = dashaList.findIndex(item => {
                const now = new Date();
                return now >= new Date(item.start_date) && now <= new Date(item.end_date);
            });

            if (currentIdx !== -1) {
                // Small delay to ensure layout is captured
                setTimeout(() => {
                    const yPos = itemLayouts.current[currentIdx];
                    if (yPos !== undefined && scrollViewRef.current) {
                        scrollViewRef.current.scrollTo({ y: yPos - 100, animated: true });
                    }
                }, 500);
            }
        }
    }, [loading, activeTab, dashaList]);

    const fetchData = async () => {
        try {
            const user = await authApi.getMe();
            setUserData(user);
            
            // 1. Fetch Life Predictions
            const resLife = await apiRequest('/life-predictions', { method: 'GET' });
            if (resLife.status === 'success') {
                setPredictions(resLife.predictions);
            }

            // 2. Fetch Dasha Bhukti
            if (user.dob && user.tob) {
                const resDasha = await horoscopeApi.getDashaBhukti({
                    date_of_birth: user.dob,
                    time_of_birth: user.tob,
                    latitude: user.latitude || 11.0168,
                    longitude: user.longitude || 76.9558
                });
                if (resDasha.flat_list) {
                    setDashaList(resDasha.flat_list);
                }
            }
        } catch (e) {
            console.error("Failed to fetch predictions", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailedReport = async (item: any) => {
        setSelectedPhase(item);
        setDetailedReport('');
        setShowModal(true);
        setLoadingDetail(true);

        const MODEL_SWARM = [
            "HectorHe/DeepSeek-V2-Lite-aux-free-sft-math7k-1epoch-1e-4-gamma",
            "mistralai/Mistral-7B-v0.3",
            "Qwen/Qwen2.5-72B-Instruct",
            "microsoft/Phi-3-mini-4k-instruct"
        ];

        try {
            const systemPrompt = `Your name is 'Mai' (மை), a legendary Divine Sage. 
            TASK: Generate a COMPREHENSIVE, 100-line detailed astrological report for the following period.
            Dasha: ${item.lord}, Bhukti: ${item.bhukti || 'Main'}, Dates: ${item.start_date} to ${item.end_date}.
            User: ${userData?.name || 'Friend'}, Rasi: ${userData?.rasi || 'Unknown'}, Star: ${userData?.nakshatra || 'Unknown'}.
            RULES: Respond in Professional TAMIL (தமிழ்). Be extremely detailed yet direct. Mention specific impacts on Career, Health, Family, and Wealth.`;

            let report = "";

            for (const modelId of MODEL_SWARM) {
                try {
                    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                                "Authorization": `Bearer ${process.env.EXPO_PUBLIC_HF_TOKEN || ''}`
                        },
                        body: JSON.stringify({
                            inputs: `${systemPrompt}\nDetailed Report: `,
                            parameters: { max_new_tokens: 1000, temperature: 0.5 }
                        })
                    });

                    if (hfResponse.ok) {
                        const hfData = await hfResponse.json();
                        let result = hfData[0]?.generated_text;
                        if (result) {
                            report = result.split("Detailed Report: ")[1] || result;
                            if (report.trim() && report.length > 50) break;
                        }
                    }
                } catch (e) {
                    console.warn(`Report Brain ${modelId} failed, trying next...`);
                }
            }

            if (report) {
                setDetailedReport(report.trim());
                setLoadingDetail(false);
                return;
            }

            console.warn("HF Swarm Detail Fail, falling back to server...");
            const res = await apiRequest('/predictions/detailed', {
                method: 'POST',
                body: JSON.stringify({
                    dasha: item.lord,
                    bhukti: item.bhukti,
                    start_date: item.start_date,
                    end_date: item.end_date
                })
            });

            if (res.status === 'success') {
                setDetailedReport(res.report);
            } else {
                setDetailedReport("மன்னிக்கவும்! விவரமான தகவல்களைப் பெறுவதில் சிறு தடங்கல். மீண்டும் முயற்சிக்கவும்.");
            }
        } catch (error) {
            setDetailedReport("விண்மீன்கள் நகர்வை கணக்கிடுவதில் தாமதம் ஏற்படுகிறது. 🌟");
        } finally {
            setLoadingDetail(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: Branding.black }]}>
                <ActivityIndicator size="large" color={Branding.gold} />
                <Text style={{ color: Branding.gold, marginTop: 10 }}>Star Chart Initializing... ✨</Text>
            </View>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            month: 'short', year: 'numeric'
        });
    };

    return (
        <ScrollView 
            ref={scrollViewRef}
            style={[styles.container, { backgroundColor: Branding.black }]} 
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.header}>
                <Text style={styles.headerTitle}>Predictions</Text>
                <Text style={styles.headerSubtitle}>உங்களுக்கான கணிப்புகள்</Text>
                
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'dasha' && styles.activeTab]} 
                        onPress={() => setActiveTab('dasha')}
                    >
                        <Text style={[styles.tabText, activeTab === 'dasha' && styles.activeTabText]}>Dasha Timeline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'timeline' && styles.activeTab]} 
                        onPress={() => setActiveTab('timeline')}
                    >
                        <Text style={[styles.tabText, activeTab === 'timeline' && styles.activeTabText]}>Life Guide</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {activeTab === 'dasha' ? (
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLine} />
                        {dashaList.length === 0 ? (
                            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40, opacity: 0.6 }}>Calculation in progress...</Text>
                        ) : (
                            dashaList.map((item, idx) => {
                                const isCurrent = new Date() >= new Date(item.start_date) && new Date() <= new Date(item.end_date);
                                return (
                                    <Animated.View 
                                        key={idx} 
                                        entering={FadeInDown.delay(idx * 50).springify()}
                                        style={styles.timelineItem}
                                        onLayout={(event) => {
                                            itemLayouts.current[idx] = event.nativeEvent.layout.y;
                                        }}
                                    >
                                        <View style={styles.dotContainer}>
                                            <View style={[styles.timelineDot, isCurrent && styles.currentDotHighlight]}>
                                                <MaterialCommunityIcons 
                                                    name={isCurrent ? "star-face" : "calendar-star"} 
                                                    size={12} 
                                                    color={Branding.black} 
                                                />
                                            </View>
                                        </View>

                                        <TouchableOpacity 
                                            activeOpacity={0.8}
                                            onPress={() => fetchDetailedReport(item)}
                                            style={[styles.card, isCurrent && styles.currentCard]}
                                        >
                                            <LinearGradient
                                                colors={isCurrent ? ['rgba(212, 175, 55, 0.25)', 'rgba(5, 5, 5, 0.8)'] : ['rgba(255, 255, 255, 0.05)', 'rgba(5, 5, 5, 0.5)']}
                                                style={styles.cardGradient}
                                            >
                                                <View style={styles.dashaHeader}>
                                                    <View style={styles.lordBadges}>
                                                        <View style={styles.lordBadge}>
                                                            <Text style={styles.lordLabel}>DASHA</Text>
                                                            <Text style={styles.lordValue}>{item.dasha}</Text>
                                                        </View>
                                                        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
                                                        <View style={[styles.lordBadge, { borderColor: Branding.gold }]}>
                                                            <Text style={[styles.lordLabel, { color: Branding.gold }]}>BHUKTI</Text>
                                                            <Text style={styles.lordValue}>{item.bhukti}</Text>
                                                        </View>
                                                    </View>
                                                    {isCurrent && (
                                                        <View style={styles.activeLabel}>
                                                            <Text style={styles.activeLabelText}>CURRENT PHASE</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={styles.dateRange}>
                                                    <Ionicons name="time-outline" size={12} color="rgba(212, 175, 55, 0.6)" />
                                                    <Text style={styles.dateText}>
                                                        {formatDate(item.start_date)} — {formatDate(item.end_date)}
                                                    </Text>
                                                </View>
                                                
                                                <Text style={styles.impactText}>{item.impact}</Text>
                                                
                                                <View style={styles.ctaRow}>
                                                    <Text style={styles.ctaText}>Click for 100-line detailed report</Text>
                                                    <Ionicons name="arrow-forward-circle" size={18} color={Branding.gold} />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        )}
                    </View>
                ) : (
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLine} />
                        {predictions.length === 0 ? (
                            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40, opacity: 0.6 }}>No guide entries found.</Text>
                        ) : (
                            predictions.map((p, idx) => (
                                <Animated.View 
                                    key={idx}
                                    entering={FadeInDown.delay(idx * 150).springify()}
                                    style={styles.timelineItem}
                                >
                                    <View style={styles.dotContainer}>
                                        <View style={styles.timelineDot}>
                                            <Ionicons name={p.icon || 'star'} size={14} color={Branding.black} />
                                        </View>
                                    </View>

                                    <View style={styles.card}>
                                        <LinearGradient
                                            colors={['rgba(212, 175, 55, 0.12)', 'rgba(10, 10, 10, 0.5)']}
                                            style={styles.cardGradient}
                                        >
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.categoryLabel}>{p.category}</Text>
                                                <Text style={styles.cardTitle}>{p.title}</Text>
                                                <View style={styles.divider} />
                                                <Text style={styles.cardTitleTa}>{p.title_ta}</Text>
                                            </View>
                                            
                                            <Text style={styles.cardText}>{p.prediction}</Text>
                                            
                                            <LinearGradient 
                                                colors={['rgba(212, 175, 55, 0.05)', 'transparent']}
                                                style={styles.tamilBox}
                                            >
                                                <Text style={styles.cardTextTa}>{p.prediction_ta}</Text>
                                            </LinearGradient>
                                        </LinearGradient>
                                    </View>
                                </Animated.View>
                            ))
                        )}
                    </View>
                )}
            </View>

            {/* Detailed Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <Animated.View entering={FadeInDown} style={styles.modalContent}>
                        <LinearGradient colors={['#1a1a1a', '#000']} style={styles.modalGradient}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalTitle}>{selectedPhase?.dasha} - {selectedPhase?.bhukti}</Text>
                                    <Text style={styles.modalSubtitle}>Detailed Analysis Report</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeIcon}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                {loadingDetail ? (
                                    <View style={styles.modalLoading}>
                                        <ActivityIndicator size="large" color={Branding.gold} />
                                        <Text style={styles.loadingText}>ஜீவநாடியிலிருந்து விவரங்கள் சேகரிக்கப்படுகின்றன... 😇✨</Text>
                                    </View>
                                ) : (
                                    <View style={styles.reportTextContainer}>
                                        <Text style={styles.detailedReportText}>
                                            {detailedReport}
                                        </Text>
                                        <View style={{ height: 50 }} />
                                    </View>
                                )}
                            </ScrollView>

                            <TouchableOpacity 
                                style={styles.closeBtn} 
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.closeBtnText}>புரிகிறது, நன்றி</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Animated.View>
                </View>
            </Modal>

            <View style={{ height: 120 }} />
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        padding: 30, 
        paddingTop: 40, 
        alignItems: 'center',
        borderBottomLeftRadius: 40, 
        borderBottomRightRadius: 40,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    },
    headerTitle: { 
        fontSize: 32, 
        fontWeight: '900', 
        color: Branding.gold,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 5,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 25,
        padding: 4,
        marginTop: 20,
        width: '90%',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: Branding.gold,
    },
    tabText: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        fontSize: 13,
    },
    activeTabText: {
        color: Branding.black,
    },
    content: { padding: 20 },
    timelineContainer: {
        marginLeft: 10,
        paddingLeft: 20,
    },
    timelineLine: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgba(212, 175, 55, 0.3)',
    },
    timelineItem: {
        marginBottom: 35,
    },
    dotContainer: {
        position: 'absolute',
        left: -32,
        top: 15,
        zIndex: 10,
    },
    timelineDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Branding.gold,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#000',
    },
    currentDotHighlight: {
        backgroundColor: Branding.gold,
        borderColor: '#FFD700',
        transform: [{ scale: 1.2 }],
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        elevation: 5,
    },
    currentCard: {
        borderColor: 'rgba(212, 175, 55, 0.5)',
        borderWidth: 2,
    },
    cardGradient: {
        padding: 20,
    },
    dashaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    lordBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    lordBadge: {
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 60,
    },
    lordLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
    },
    lordValue: {
        fontSize: 13,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
    },
    activeLabel: {
        backgroundColor: Branding.gold,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    activeLabelText: {
        color: Branding.black,
        fontSize: 9,
        fontWeight: '900',
    },
    dateRange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    dateText: {
        fontSize: 12,
        color: 'rgba(212, 175, 55, 0.8)',
        fontWeight: '700',
    },
    impactText: {
        fontSize: 14,
        lineHeight: 20,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 175, 55, 0.1)',
        marginTop: 5,
    },
    ctaText: {
        fontSize: 11,
        color: Branding.gold,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    modalGradient: {
        flex: 1,
        padding: 25,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: Branding.gold,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
    },
    closeIcon: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    modalScroll: {
        flex: 1,
    },
    modalLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        color: Branding.gold,
        marginTop: 20,
        textAlign: 'center',
        fontFamily: Fonts.tamil,
        fontSize: 16,
    },
    reportTextContainer: {
        paddingVertical: 10,
    },
    detailedReportText: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 28,
        opacity: 0.9,
        fontFamily: Fonts.tamil,
        textAlign: 'justify',
    },
    closeBtn: {
        backgroundColor: Branding.gold,
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 15,
    },
    closeBtnText: {
        color: Branding.black,
        fontSize: 16,
        fontWeight: '900',
    },
    cardHeader: {
        marginBottom: 15,
    },
    categoryLabel: {
        color: Branding.gold,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    cardTitleTa: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    divider: {
        height: 1,
        width: 40,
        backgroundColor: Branding.gold,
        marginVertical: 10,
        opacity: 0.5,
    },
    cardText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#fff',
        opacity: 0.9,
    },
    tamilBox: {
        marginTop: 15,
        padding: 15,
        borderRadius: 15,
        borderLeftWidth: 3,
        borderLeftColor: Branding.gold,
    },
    cardTextTa: {
        fontSize: 15,
        lineHeight: 24,
        color: Branding.gold,
        opacity: 0.8,
        fontStyle: 'italic',
    },
});
