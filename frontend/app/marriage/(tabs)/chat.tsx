import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { aiApi, authApi } from '@/services/api';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors, Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'luck', title: 'Marriage Luck', icon: 'heart-outline' },
    { id: 'dosha', title: 'Dosha & Remedies', icon: 'shield-outline' },
    { id: 'matching', title: 'Compatibility', icon: 'people-outline' },
    { id: 'muhurtham', title: 'Upcoming Dates', icon: 'calendar-outline' },
];

const SUGGESTED_QUESTIONS: any = {
    luck: [
        "How is my marriage luck today?",
        "When is the best time for my wedding?",
        "Will I have a love or arranged marriage?",
    ],
    dosha: [
        "Do I have Kuja Dosha?",
        "How to reduce Papa Samya effects?",
        "Remedies for late marriage?",
    ],
    matching: [
        "Which Nakshatra is best for me?",
        "My compatibility with someone from Simha Rasi?",
        "What are my positive relationship traits?",
    ],
    muhurtham: [
        "Next auspicious day for engagement?",
        "Good time for visiting a bride/groom?",
        "Is this month good for starting rituals?",
    ]
};

export default function MarriageChat() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const navigation = useNavigation();
    
    const [messages, setMessages] = useState([
        { id: '1', text: "வணக்கம்! ✨ நான் மீரா, உங்க மேரேஜ் ஜோசியர். கல்யாண மேட்சிங் பத்தி பாக்கலாமா? இன்னைக்கு என்ன தெரிஞ்சுக்கணும் சொல்லுங்க! 😇💖", isAi: true }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
    const [userData, setUserData] = useState<any>(null);
    const [inputTextTop, setInputTextTop] = useState('');
    const [showPredefined, setShowPredefined] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchUserData();
    }, []);
    
    useLayoutEffect(() => {
        navigation.setOptions({
            tabBarStyle: { display: 'none' }
        });
    }, [navigation]);

    const fetchUserData = async () => {
        try {
            const data = await authApi.getMe();
            setUserData(data);
        } catch (error) {
            console.error('Failed to fetch user data for chat context', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const handleSend = async (text: string) => {
        if (!text) return;
        
        const userMsg = { id: Date.now().toString(), text, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        scrollToBottom();

        try {
            // Include user context and ENFORCE Tamil
            const context = userData ? `User Context: ${userData.rasi} rasi, ${userData.nakshatra} nakshatra. ` : "";
            const response = await aiApi.chat(`${context} ${text}`);
            const aiMsg = { id: (Date.now() + 1).toString(), text: response.reply || response.response || "மன்னிக்கவும், என்னால் இப்போது பதில் கூற முடியவில்லை. ✨", isAi: true };
            setMessages(prev => [...prev, aiMsg]);
            scrollToBottom();
        } catch (error) {
            const errorMsg = { id: (Date.now() + 1).toString(), text: "அய்யோ! ஸ்டார்ஸ் கனெக்ட் ஆகல, சிக்னல் கொஞ்சம் வீக்கா இருக்கு. மறுபடியும் ட்ரை பண்ணுங்க! 😇💫", isAi: true };
            setMessages(prev => [...prev, errorMsg]);
            scrollToBottom();
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        setMessages([
            { id: '1', text: "சேட் கிளியர் ஆயிடுச்சு! புதுசா ஆரம்பிக்கலாமா? ரெடியா? ✨😇", isAi: true }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Cinematic Video Header */}
            <View style={[styles.headerVideoContainer, { paddingTop: insets.top }]}>
                <Image
                    source={require('@/assets/images/angel-pic.png')}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                />
                <LinearGradient
                    colors={['rgba(5,5,5,0.2)', 'rgba(5,5,5,0.8)', Branding.black]}
                    style={StyleSheet.absoluteFill}
                />
                
                <View style={styles.headerOverlayContent}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.statusInner}>
                            <View style={styles.activePulse} />
                            <Text style={styles.agentTitle}>MIRA AI AGENT 😇</Text>
                        </View>
                        <Text style={styles.agentMode}>Online & Calculating Stars</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
                            <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.replace('/marriage/(tabs)')} style={[styles.clearBtn, { backgroundColor: 'rgba(244, 63, 94, 0.2)' }]}>
                            <Ionicons name="close" size={22} color="#F43F5E" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Suggested Interaction Panel (Categories & Questions) */}
            {showPredefined && (
                <View style={styles.suggestionPanel}>
                    {/* Selectable Categories (Premium Chips) */}
                    <View style={styles.categoryContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={[styles.categoryChip, selectedCategory === cat.id && styles.activeCategoryChip]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={cat.icon as any} size={16} color={selectedCategory === cat.id ? Branding.black : Branding.gold} />
                                    <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.activeCategoryText]}>{cat.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Predefined Questions (Horizontal Dropdown-style) */}
                    <View style={styles.questionContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questionScroll}>
                            {SUGGESTED_QUESTIONS[selectedCategory].map((q: string, idx: number) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={styles.questionButton}
                                    onPress={() => {
                                        handleSend(q);
                                        setShowPredefined(false);
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.questionButtonText}>{q}</Text>
                                    <Ionicons name="chevron-forward" size={12} color="rgba(212, 175, 55, 0.4)" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatList}
                    renderItem={({ item }) => (
                        <Animated.View 
                            entering={FadeInDown.springify()} 
                            style={[styles.bubbleWrapper, item.isAi ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' }]}
                        >
                            {item.isAi ? (
                                <View style={[styles.bubble, styles.aiBubble]}>
                                    <View style={[styles.aiBubbleDecoration, { backgroundColor: Branding.gold, opacity: 0.1 }]} />
                                    <MessageContent text={item.text} isAi />
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={[Branding.gold, '#B8860B']}
                                    style={[styles.bubble, styles.userBubble]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={[styles.msgText, { color: Branding.black, fontWeight: '700' }]}>{item.text}</Text>
                                </LinearGradient>
                            )}
                        </Animated.View>
                    )}
                    ListFooterComponent={() => isTyping ? (
                        <View style={styles.typingContainer}>
                            <LinearGradient
                                colors={['rgba(212, 175, 55, 0.15)', 'transparent']}
                                style={styles.typingDots}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <ActivityIndicator size="small" color={Branding.gold} />
                                <Text style={styles.typingText}>Mira is reading stars... 😇</Text>
                            </LinearGradient>
                        </View>
                    ) : null}
                />

                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity 
                            style={styles.bottomPlusBtn}
                            onPress={() => setShowPredefined(!showPredefined)}
                        >
                            <Ionicons name={showPredefined ? "close" : "add"} size={24} color={Branding.black} />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="ஜோசியரிடம் கேட்கவும்..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={inputText}
                            onChangeText={setInputText}
                            onFocus={() => setShowPredefined(true)}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
                            onPress={() => {
                                handleSend(inputText);
                                setInputText('');
                            }}
                            disabled={!inputText.trim() || isTyping}
                        >
                            <Ionicons name="send" size={20} color={Branding.black} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    headerVideoContainer: { 
        height: 160,
        width: '100%',
        overflow: 'hidden',
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(212, 175, 55, 0.3)',
        backgroundColor: '#000'
    },
    headerOverlayContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 25,
        paddingBottom: 15,
    },
    statusInner: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    activePulse: { 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: '#FFD56F', 
        marginRight: 10,
        shadowColor: '#FFD56F',
        shadowRadius: 4,
        shadowOpacity: 0.8
    },
    agentTitle: { color: Branding.gold, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    agentMode: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, letterSpacing: 1 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    historyBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
    clearBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
    
    // Category Chips
    categoryContainer: { backgroundColor: 'rgba(10,10,10,0.8)', paddingVertical: 12 },
    categoryScroll: { paddingHorizontal: 15, gap: 10 },
    categoryChip: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 25, 
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        gap: 8
    },
    activeCategoryChip: { backgroundColor: Branding.gold, borderColor: Branding.gold },
    categoryChipText: { color: Branding.gold, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    activeCategoryText: { color: Branding.black },

    bottomPlusBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Branding.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },

    // Predefined Questions
    questionContainer: { paddingBottom: 15, backgroundColor: 'rgba(10,10,10,0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.1)' },
    questionScroll: { paddingHorizontal: 15, gap: 10 },
    questionButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 14, 
        paddingVertical: 10, 
        borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 10
    },
    questionButtonText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },

    chatList: { padding: 20, paddingTop: 10, paddingBottom: 100 },
    bubbleWrapper: { marginBottom: 15, maxWidth: '85%' },
    bubble: { padding: 16, borderRadius: 25 },
    aiBubble: { 
        backgroundColor: 'rgba(255,255,255,0.12)', 
        borderBottomLeftRadius: 4, 
        borderWidth: 1.5, 
        borderColor: 'rgba(212, 175, 55, 0.3)',
        overflow: 'hidden',
    },
    aiBubbleDecoration: { position: 'absolute', top: 0, left: 0, height: '100%', width: 4 },
    userBubble: { borderBottomRightRadius: 4 },
    msgText: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.95)', fontFamily: Fonts.tamil },
    typingContainer: { paddingHorizontal: 20, marginVertical: 15 },
    typingDots: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 25, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', overflow: 'hidden' },
    typingText: { color: Branding.gold, fontSize: 12, marginLeft: 10, fontFamily: Fonts.tamil },
    
    boldText: { fontFamily: Fonts.tamilBold, color: Branding.gold },
    italicText: { fontFamily: Fonts.tamil, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    
    // New Input Styles
    inputWrapper: {
        backgroundColor: '#0A0A0A',
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 175, 55, 0.2)',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Tab bar is hidden, so reduce padding
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 15,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    sendBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: Branding.gold,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: Branding.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
});

function MessageContent({ text, isAi }: { text: string, isAi: boolean }) {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
        <Text style={[styles.msgText, { color: '#FFF' }]}>
            {parts.map((part, index) => {
                if (part && part.startsWith('**') && part.endsWith('**')) return <Text key={index} style={styles.boldText}>{part.slice(2, -2)}</Text>;
                if (part && part.startsWith('*') && part.endsWith('*')) return <Text key={index} style={styles.italicText}>{part.slice(1, -1)}</Text>;
                return part;
            })}
        </Text>
    );
}


