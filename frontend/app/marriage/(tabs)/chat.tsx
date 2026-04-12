import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, ScrollView, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { aiApi, authApi, walletApi } from '@/services/api';
import { Branding, Fonts } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SESSION_PRICE = 3;
const SESSION_DURATION = 120; // 2 minutes

const CATEGORIES = [
    { id: 'luck', title: 'Marriage Luck', icon: 'heart-outline' },
    { id: 'dosha', title: 'Dosha & Remedies', icon: 'shield-outline' },
    { id: 'matching', title: 'Compatibility', icon: 'people-outline' },
    { id: 'muhurtham', title: 'Upcoming Dates', icon: 'calendar-outline' },
];

const SUGGESTED_QUESTIONS: any = {
    luck: ["How is my marriage luck today?", "When is the best time for my wedding?", "Will I have a love or arranged marriage?"],
    dosha: ["Do I have Kuja Dosha?", "How to reduce Papa Samya effects?", "Remedies for late marriage?"],
    matching: ["Which Nakshatra is best for me?", "My compatibility with someone from Simha Rasi?", "What are my positive relationship traits?"],
    muhurtham: ["Next auspicious day for engagement?", "Good time for visiting a bride/groom?", "Is this month good for starting rituals?"]
};

export default function MarriageChat() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const navigation = useNavigation();
    
    const [messages, setMessages] = useState([{ id: '1', text: "வணக்கம்! ✨ நான் மீரா, உங்க மேரேஜ் ஜோசியர். கல்யாண மேட்சிங் பத்தி பாக்கலாமா? இன்னைக்கு என்ன தெரிஞ்சுக்கணும் சொல்லுங்க! 😇💖", isAi: true }]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
    const [userData, setUserData] = useState<any>(null);
    const [showPredefined, setShowPredefined] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchUserData();
        checkInitialState();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        if (isSessionActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsSessionActive(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isSessionActive, timeLeft]);

    const checkInitialState = async () => {
        try {
            const res = await walletApi.getBalance();
            if (res.data.is_free_access_active) {
                setIsSessionActive(true);
                setTimeLeft(600);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePayToContinue = async () => {
        try {
            setLoading(true);
            const res = await walletApi.debit(SESSION_PRICE);
            if (res.status === 'success') {
                setIsSessionActive(true);
                setTimeLeft(SESSION_DURATION);
            }
        } catch (e: any) {
            if (e.response?.status === 402) {
                Alert.alert('Low Balance', 'Please recharge your wallet to continue chatting with Mira.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const data = await authApi.getMe();
            setUserData(data);
        } catch (error) {
            console.error('Failed to fetch user data for chat context', error);
        }
    };

    const handleSend = async (text: string) => {
        if (!text || !isSessionActive) return;
        
        const userMsg = { id: Date.now().toString(), text, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const context = userData ? `User Context: ${userData.rasi} rasi, ${userData.nakshatra} nakshatra. ` : "";
            const response = await aiApi.chat(`${context} ${text}`);
            const aiMsg = { id: (Date.now() + 1).toString(), text: response.reply || response.response || "மன்னிக்கவும்...", isAi: true };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg = { id: (Date.now() + 1).toString(), text: "அய்யோ! மறுபடியும் ட்ரை பண்ணுங்க! 😇💫", isAi: true };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerVideoContainer, { paddingTop: insets.top }]}>
                <Image source={require('@/assets/images/angel-pic.png')} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={['rgba(5,5,5,0.2)', 'rgba(5,5,5,0.8)', Branding.black]} style={StyleSheet.absoluteFill} />
                <View style={styles.headerOverlayContent}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.statusInner}>
                            <View style={styles.activePulse} />
                            <Text style={styles.agentTitle}>MIRA AI AGENT 😇</Text>
                        </View>
                        <Text style={styles.agentMode}>{isSessionActive ? `Session active: ${formatTime(timeLeft)}` : 'Session Expired'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.replace('/marriage/(tabs)')} style={styles.clearBtn}>
                        <Ionicons name="close" size={22} color="#F43F5E" />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatList}
                    renderItem={({ item }) => (
                        <Animated.View entering={FadeInDown} style={[styles.bubbleWrapper, item.isAi ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' }]}>
                            {item.isAi ? (
                                <View style={[styles.bubble, styles.aiBubble]}>
                                    <MessageContent text={item.text} />
                                </View>
                            ) : (
                                <LinearGradient colors={[Branding.gold, '#B8860B']} style={[styles.bubble, styles.userBubble]}>
                                    <Text style={[styles.msgText, { color: Branding.black, fontWeight: '700' }]}>{item.text}</Text>
                                </LinearGradient>
                            )}
                        </Animated.View>
                    )}
                    ListFooterComponent={() => isTyping ? (
                        <ActivityIndicator size="small" color={Branding.gold} style={{ alignSelf: 'flex-start', marginLeft: 20 }} />
                    ) : null}
                />

                {isSessionActive ? (
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="ஜோசியரிடம் கேட்கவும்..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendBtn} onPress={() => { handleSend(inputText); setInputText(''); }}>
                                <Ionicons name="send" size={20} color={Branding.black} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={30} color={Branding.gold} />
                        <Text style={styles.lockTitle}>Premium Marriage Session</Text>
                        <Text style={styles.lockDesc}>Mira is ready to read your marriage stars. Start a 2-minute session for ₹3.</Text>
                        <TouchableOpacity style={styles.payButton} onPress={handlePayToContinue} disabled={loading}>
                            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payButtonText}>Pay ₹3 to Continue</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

function MessageContent({ text }: { text: string }) {
    return <Text style={{ color: '#FFF', fontSize: 15, lineHeight: 22, fontFamily: Fonts.tamil }}>{text}</Text>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    headerVideoContainer: { height: 120, width: '100%', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.3)' },
    headerOverlayContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 25, paddingBottom: 15 },
    statusInner: { flexDirection: 'row', alignItems: 'center' },
    activePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD56F', marginRight: 10 },
    agentTitle: { color: Branding.gold, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    agentMode: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginTop: 2 },
    clearBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
    chatList: { padding: 20, paddingBottom: 100 },
    bubbleWrapper: { marginBottom: 15, maxWidth: '85%' },
    bubble: { padding: 16, borderRadius: 25 },
    aiBubble: { backgroundColor: 'rgba(255,255,255,0.12)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    userBubble: { borderBottomRightRadius: 4 },
    msgText: { fontSize: 15, lineHeight: 22 },
    inputWrapper: { backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: 'rgba(212, 175, 55, 0.2)', paddingBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 12 },
    input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12, color: '#fff', fontSize: 15, maxHeight: 120 },
    sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: Branding.gold, justifyContent: 'center', alignItems: 'center' },
    lockOverlay: { padding: 25, backgroundColor: '#0D0D0D', alignItems: 'center', borderTopWidth: 1, borderTopColor: Branding.gold, paddingBottom: 50 },
    lockTitle: { color: Branding.gold, fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    lockDesc: { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
    payButton: { backgroundColor: Branding.gold, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, marginTop: 20 },
    payButtonText: { color: '#000', fontWeight: 'bold' }
});
