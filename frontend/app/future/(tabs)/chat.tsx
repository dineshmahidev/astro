import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { aiApi, authApi } from '@/services/api';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors, Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function FutureChat() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    
    const [messages, setMessages] = useState([
        { id: '1', text: "வணக்கம்! ✨ நான் தான் மை (MAI). விதியின் ரகசியங்களை நேரடியாகக் கூறக் காத்திருக்கிறேன். உங்கள் எதிர்காலம் பத்தி என்ன தெரிஞ்சுக்கணும்? 🔮✨", isAi: true }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await authApi.getMe();
            setUserData(data);
        } catch (e) {
            console.error(e);
        }
    };
    
    const flatListRef = useRef<FlatList>(null);

    const handleError = () => {
        const errorMsg = { id: (Date.now() + 2).toString(), text: "விண்மீன் தொடர்பில் சிறு தடை! மீண்டும் ஒருமுறை முயற்சி செய். 🔮✨", isAi: true };
        setMessages(prev => [...prev, errorMsg]);
    };

    const scrollToBottom = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    // 3. Optimized Chat Message Component for Performance
    const ChatMessage = React.memo(({ item }: { item: any }) => (
        <Animated.View 
            entering={FadeInDown.duration(400).springify()} 
            style={[
                styles.messageRow,
                item.isAi ? styles.aiRow : styles.userRow
            ]}
        >
            <View style={[
                styles.messageBubble,
                item.isAi ? styles.aiBubble : styles.userBubble,
                { borderBottomLeftRadius: item.isAi ? 4 : 20, borderBottomRightRadius: item.isAi ? 20 : 4 }
            ]}>
                {item.isAi && (
                    <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>MAI WIZARD 🔮</Text>
                    </View>
                )}
                <Text style={[styles.messageText, item.isAi ? styles.aiText : styles.userText]}>
                    {item.text}
                </Text>
                <Text style={styles.messageTime}>{item.time || 'now'}</Text>
            </View>
        </Animated.View>
    ));

    const handleSend = async (text: string = inputText) => {
        const msgToSend = text.trim();
        if (!msgToSend) return;
        
        // 1. User Message
        const userMsg = { id: Date.now().toString(), text: msgToSend, isAi: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);
        scrollToBottom();

        // 2. Faster Model Swarm (Stability First)
        const MODEL_SWARM = [
            "meta-llama/Llama-3.2-1B-Instruct", // Ultra-fast, highly stable for mobile
            "HectorHe/DeepSeek-V2-Lite-aux-free-sft-math7k-1epoch-1e-4-gamma",
            "mistralai/Mistral-7B-v0.3",
            "microsoft/Phi-3-mini-4k-instruct"
        ];

        let aiText = "";

        try {
            const context = `User: ${userData?.name || 'Friend'}, Rasi: ${userData?.rasi || 'Unknown'}, Star: ${userData?.nakshatra || 'Unknown'}`;
            const systemPrompt = `Your name is 'Mai' (மை), a legendary Sage Wizard.
            RULES: Answer directly in TAMIL. Be straightforward (no valavala). Be bold.
            Context: ${context}`;

            // (AI logic loop remains same but with faster models)
            for (const modelId of MODEL_SWARM) {
                try {
                    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.EXPO_PUBLIC_HF_TOKEN || ''}` },
                        body: JSON.stringify({
                            inputs: `${systemPrompt}\nUser: ${msgToSend}\nMai: `,
                            parameters: { max_new_tokens: 300, temperature: 0.6 }
                        })
                    });

                    if (hfResponse.ok) {
                        const hfData = await hfResponse.json();
                        let result = hfData[0]?.generated_text;
                        if (result) {
                            aiText = result.split("Mai: ")[1] || result;
                            if (aiText.trim()) break;
                        }
                    } else if (hfResponse.status === 503) {
                        console.log(`${modelId} is sleeping, skipping...`);
                        continue;
                    }
                } catch (e) {
                    console.warn(`Model ${modelId} unreachable.`);
                }
            }

            if (!aiText) {
                console.warn("Swarm failed, switching to Backend...");
                const response = await aiApi.chat(msgToSend);
                aiText = response.reply || response.response;
            }

            const aiMsg = { 
                id: (Date.now() + 1).toString(), 
                text: aiText || "விதியின் வழியில் சிறு தாமதம். 🔮✨", 
                isAi: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
            scrollToBottom();
        } catch (error) {
            handleError();
            scrollToBottom();
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        setMessages([
            { id: '1', text: "சுவடுகள் அழிக்கப்பட்டன. புதிய கேள்விகள் கேட்கலாம். 🔮✨", isAi: true }
        ]);
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >

                <View style={[styles.headerVideoContainer, { paddingTop: 10 }]}>
                    <Image
                        source={require('@/assets/images/wizard-pic.png')}
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
                                <Text style={styles.agentTitle}>MAI WIZARD 🔮</Text>
                            </View>
                            <Text style={styles.agentMode}>Directing Celestial Cycles</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/marriage/history', params: { initialTab: 'chat' } })} style={styles.historyBtn}>
                                <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
                                <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatList}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                    renderItem={({ item }) => <ChatMessage item={item} />}
                    ListFooterComponent={() => isTyping ? (
                        <View style={styles.typingContainer}>
                            <ActivityIndicator size="small" color={Branding.gold} />
                            <Text style={styles.typingText}>Mai is consulting the cosmos... 🔮</Text>
                        </View>
                    ) : null}
                />

                <View style={styles.inputAreaWrapper}>
                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.input}
                            placeholder="நட்சத்திர கணிப்பு கேட்கவும்..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
                            <Ionicons name="send" size={24} color={Branding.black} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Branding.black,
    },
    headerVideoContainer: {
        height: 180,
        width: '100%',
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.3)',
        backgroundColor: '#000',
    },
    chatList: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    messageRow: {
        width: '100%',
        marginBottom: 16,
        paddingHorizontal: 5,
    },
    aiRow: {
        alignItems: 'flex-start',
    },
    userRow: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    aiBubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)',
    },
    userBubble: {
        backgroundColor: Branding.gold,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: Fonts.tamil,
    },
    aiText: {
        color: '#fff',
    },
    userText: {
        color: Branding.black,
        fontWeight: '600',
    },
    messageTime: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.3)',
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        opacity: 0.6,
    },
    aiBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: Branding.gold,
        letterSpacing: 1,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: Fonts.tamil,
    },
    typingContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        color: Branding.gold,
        marginLeft: 10,
        fontSize: 13,
        fontFamily: Fonts.tamil,
        fontStyle: 'italic',
    },
    inputAreaWrapper: {
        backgroundColor: 'rgba(5,5,5,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 175, 55, 0.2)',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    inputArea: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 16,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    sendButton: {
        width: 50,
        height: 50,
        backgroundColor: Branding.gold,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Branding.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
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
    headerActions: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12 
    },
    historyBtn: { 
        padding: 8, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.1)'
    },
    clearBtn: { 
        padding: 8, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255,255,255,0.05)' 
    },
    boldText: { fontWeight: 'bold', color: Branding.gold },
    italicText: { fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});

function MessageContent({ text, isAi }: { text: string, isAi: boolean }) {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return (
        <Text style={[styles.msgText, { color: '#FFF' }]}>
            {parts.map((part, index) => {
                if (part && part.startsWith('**') && part.endsWith('**')) {
                    return <Text key={index} style={styles.boldText}>{part.slice(2, -2)}</Text>;
                }
                if (part && part.startsWith('*') && part.endsWith('*')) {
                    return <Text key={index} style={styles.italicText}>{part.slice(1, -1)}</Text>;
                }
                return part;
            })}
        </Text>
    );
}
