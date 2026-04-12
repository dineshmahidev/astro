import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Alert } from 'react-native';
import { LucideSend, LucideBot, LucideUser, LucideSparkles, LucideClock, LucideLock } from 'lucide-react-native';
import { firebaseAiApi, firebaseWalletApi } from '@/services/firebase-api';
import { Branding } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const SESSION_PRICE = 3;
const SESSION_DURATION = 120; // 2 minutes

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'வணக்கம்! நான் உங்கள் ஜோதிட உதவியாளர். மணம், வேலை, கல்வி அல்லது வாழ்க்கை பற்றி ஏதாவது கேட்க விரும்புகிறீர்களா?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkInitialState();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, timeLeft]);

  const checkInitialState = async () => {
    try {
      setCheckingWallet(true);
      const balance = await firebaseWalletApi.getBalance();
      if (balance >= SESSION_PRICE) {
        // Just show the button to start session if they have money
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingWallet(false);
    }
  };

  const handlePayToContinue = async () => {
    try {
      setLoading(true);
      const res = await firebaseWalletApi.debit(SESSION_PRICE);
      if (res.status === 'success') {
        setIsSessionActive(true);
        setTimeLeft(SESSION_DURATION);
      }
    } catch (e: any) {
      if (e.response?.status === 402) {
        Alert.alert('Low Balance', 'Please recharge your wallet to continue chatting with the divine.');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !isSessionActive) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const data = await firebaseAiApi.chat(currentInput);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'சிக்கல்! மீண்டும் முயற்சிக்கவும்.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[styles.messageWrapper, isBot ? styles.botWrapper : styles.userWrapper]}>
        {isBot && (
          <View style={styles.botIconWrapper}>
            <LucideBot color={Branding.gold} size={16} />
          </View>
        )}
        <View style={[styles.messageCard, isBot ? styles.botCard : styles.userCard]}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>{item.text}</Text>
          <Text style={styles.timestamp}>{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LucideSparkles color={Branding.gold} size={24} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>ஜோதிட சாட்</Text>
            {isSessionActive && (
                <View style={styles.timerBox}>
                    <LucideClock size={12} color={timeLeft < 30 ? '#FF4444' : Branding.gold} />
                    <Text style={[styles.timerText, timeLeft < 30 && { color: '#FF4444' }]}>{formatTime(timeLeft)}</Text>
                </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/topup')} style={styles.walletHeaderBtn}>
             <LucideUser color={Branding.gold} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isSessionActive ? (
        <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="இங்கே கேட்கவும்..."
                placeholderTextColor="#666"
                value={input}
                onChangeText={setInput}
                multiline
            />
            <Pressable 
                style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]} 
                onPress={sendMessage}
                disabled={!input.trim() || loading}
            >
                {loading ? <ActivityIndicator size="small" color="#000" /> : <LucideSend color="#000" size={20} />}
            </Pressable>
            </View>
        </View>
      ) : (
          <View style={styles.lockOverlay}>
              <View style={styles.lockContainer}>
                <LucideLock color={Branding.gold} size={32} />
                <Text style={styles.lockTitle}>Session Required</Text>
                <Text style={styles.lockDesc}>Ask unlimited questions for 2 minutes by paying ₹3 from your divine wallet.</Text>
                <Pressable style={styles.payButton} onPress={handlePayToContinue} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay ₹3 to Start Chat</Text>
                    )}
                </Pressable>
                <Pressable style={styles.topupHint} onPress={() => router.push('/topup')}>
                    <Text style={styles.topupHintText}>Low Balance? Recharge Now</Text>
                </Pressable>
              </View>
          </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 60 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(212,175,55,0.2)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerInfo: { alignItems: 'center' },
  headerTitle: { color: Branding.gold, fontSize: 18, fontWeight: 'bold' },
  timerBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  timerText: { color: Branding.gold, fontSize: 11, fontWeight: '900' },
  walletHeaderBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  listContent: { padding: 20, paddingBottom: 100 },
  messageWrapper: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  botWrapper: { alignSelf: 'flex-start' },
  userWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageCard: { padding: 12, borderRadius: 20 },
  botCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderTopLeftRadius: 4 },
  userCard: { backgroundColor: Branding.gold, borderTopRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  botText: { color: '#E0E0E0' },
  userText: { color: '#000', fontWeight: '500' },
  timestamp: { fontSize: 10, color: '#666', marginTop: 4, alignSelf: 'flex-end' },
  inputWrapper: { backgroundColor: '#0A0A0A', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)', paddingBottom: Platform.OS === 'ios' ? 90 : 80 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, color: '#fff', fontSize: 16, maxHeight: 120 },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: Branding.gold, justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.05)' },
  lockOverlay: { padding: 20, backgroundColor: '#0A0A0A', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.3)', paddingBottom: Platform.OS === 'ios' ? 90 : 80 },
  lockContainer: { alignItems: 'center', paddingVertical: 20 },
  lockTitle: { color: Branding.gold, fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  lockDesc: { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 18 },
  payButton: { backgroundColor: Branding.gold, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 25, marginTop: 24 },
  payButtonText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  topupHint: { marginTop: 16 },
  topupHintText: { color: '#666', fontSize: 12, textDecorationLine: 'underline' }
});
