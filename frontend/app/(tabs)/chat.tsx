import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { LucideSend, LucideBot, LucideUser, LucideSparkles } from 'lucide-react-native';
import { aiApi } from '@/services/api';
import { Branding } from '@/constants/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatScreen() {
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
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

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
      const data = await aiApi.chat(currentInput);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'தொடர்பு கொள்வதில் ஒரு சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும்.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
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
        <LucideSparkles color={Branding.gold} size={24} />
        <Text style={styles.headerTitle}>ஜோதிட சாட்</Text>
        <Text style={styles.headerSubtitle}>உடனடி பதில்கள்</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

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
            {loading ? (
                <ActivityIndicator size="small" color="#000" />
            ) : (
                <LucideSend color={input.trim() ? "#000" : "#666"} size={20} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: Branding.gold,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  botWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageCard: {
    padding: 12,
    borderRadius: 20,
  },
  botCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 4,
  },
  userCard: {
    backgroundColor: Branding.gold,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#E0E0E0',
  },
  userText: {
    color: '#000',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputWrapper: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingBottom: Platform.OS === 'ios' ? 90 : 80, // Padding for tab bar
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Branding.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
