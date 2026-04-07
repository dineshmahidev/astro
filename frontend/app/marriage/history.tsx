import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { poruthamApi, palmApi, aiApi, getImageUrl } from '@/services/api';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
    const router = useRouter();
    const { initialTab } = useLocalSearchParams();
    const [tab, setTab] = useState<'palm' | 'marriage' | 'chat'>((initialTab as any) || 'marriage');
    const [loading, setLoading] = useState(true);
    const [palmHistory, setPalmHistory] = useState([]);
    const [marriageHistory, setMarriageHistory] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const mData = await poruthamApi.getHistory();
            const pData = await palmApi.getHistory();
            const cData = await aiApi.getHistory();
            setMarriageHistory(mData.history || []);
            setPalmHistory(pData.history || []);
            setChatHistory(cData.history || []);
        } catch (error) {
            console.error('Fetch history error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMarriageItem = (item: any) => (
        <TouchableOpacity 
            key={item.id} 
            style={styles.historyCard}
            onPress={() => router.push({
                pathname: '/marriage/porutham_result',
                params: {
                    result: JSON.stringify({ data: item.breakdown }),
                    groomName: item.groomName,
                    brideName: item.brideName
                }
            })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardTitle}>{item.groomName} & {item.brideName}</Text>
                    <Text style={styles.cardSubtitle}>{item.date}</Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{item.score}%</Text>
                </View>
            </View>
            <View style={styles.labelRow}>
                <Ionicons name="checkmark-circle" size={16} color="#FFD56F" />
                <Text style={styles.labelText}>{item.resultLabel}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPalmItem = (item: any) => (
        <TouchableOpacity 
            key={item.id} 
            style={styles.historyCard}
            onPress={() => router.push({
                pathname: '/palm/result',
                params: {
                    analysis: JSON.stringify(item.analysis),
                    date: item.date,
                    imageUrl: item.imageUrl
                }
            })}
        >
            <View style={styles.cardHeader}>
                {item.imageUrl && (
                    <Image
                        source={{ uri: getImageUrl(item.imageUrl) || '' }}
                        style={styles.palmThumb}
                    />
                )}
                <View style={{ flex: 1, marginLeft: item.imageUrl ? 15 : 0 }}>
                    <Text style={styles.cardTitle}>Palm Analysis</Text>
                    <Text style={styles.cardSubtitle}>{item.date}</Text>
                </View>
                <Ionicons name="hand-right" size={24} color="#FFD56F" />
            </View>
            <Text style={styles.summaryText} numberOfLines={2}>{item.analysis?.summary || 'No summary available'}</Text>
        </TouchableOpacity>
    );

    const renderChatItem = (item: any) => (
        <View key={item.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.message}</Text>
                    <Text style={styles.cardSubtitle}>{item.date}</Text>
                </View>
                <Ionicons name="chatbubbles" size={20} color="#FFD56F" />
            </View>
            <View style={styles.chatAnswerBox}>
                <Text style={styles.chatAnswerText} numberOfLines={3}>{item.response}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1d0608', '#0d0304']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFD56F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account History</Text>
                <Text style={styles.headerSubtitle}>Saved Scans & Queries</Text>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'marriage' && styles.activeTab]}
                    onPress={() => setTab('marriage')}
                >
                    <Text style={[styles.tabText, tab === 'marriage' && styles.activeTabText]}>Porutham</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'palm' && styles.activeTab]}
                    onPress={() => setTab('palm')}
                >
                    <Text style={[styles.tabText, tab === 'palm' && styles.activeTabText]}>Palmistry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'chat' && styles.activeTab]}
                    onPress={() => setTab('chat')}
                >
                    <Text style={[styles.tabText, tab === 'chat' && styles.activeTabText]}>AI Chat</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FFD56F" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    {tab === 'marriage' ? (
                        marriageHistory.length > 0 ? marriageHistory.map(renderMarriageItem) : (
                            <View style={styles.empty}>
                                <Ionicons name="heart-dislike-outline" size={60} color="#333" />
                                <Text style={styles.emptyText}>No Porutham history found</Text>
                            </View>
                        )
                    ) : tab === 'palm' ? (
                        palmHistory.length > 0 ? palmHistory.map(renderPalmItem) : (
                            <View style={styles.empty}>
                                <Ionicons name="hand-right-outline" size={60} color="#333" />
                                <Text style={styles.emptyText}>No Palm analysis history found</Text>
                            </View>
                        )
                    ) : (
                        chatHistory.length > 0 ? chatHistory.map(renderChatItem) : (
                            <View style={styles.empty}>
                                <Ionicons name="chatbubbles-outline" size={60} color="#333" />
                                <Text style={styles.emptyText}>No Chat history found</Text>
                            </View>
                        )
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0304' },
    header: { padding: 30, paddingTop: 15, alignItems: 'center' },
    backBtn: { position: 'absolute', top: 15, left: 20 },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    headerSubtitle: { color: '#FFD56F', fontSize: 14, marginTop: 4, opacity: 0.8 },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', margin: 20, borderRadius: 15, padding: 5 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#FFD56F' },
    tabText: { color: '#777', fontWeight: 'bold' },
    activeTabText: { color: '#000' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20, paddingTop: 0 },
    historyCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,213,111,0.1)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    cardSubtitle: { color: '#777', fontSize: 12, marginTop: 2 },
    scoreBadge: { backgroundColor: 'rgba(255,213,111,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    scoreText: { color: '#FFD56F', fontWeight: 'bold', fontSize: 12 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    labelText: { color: '#FFD56F', fontSize: 14, fontWeight: 'bold' },
    summaryText: { color: '#CCC', fontSize: 14, lineHeight: 20, marginTop: 5 },
    palmThumb: { width: 50, height: 65, borderRadius: 10, backgroundColor: '#222' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#555', marginTop: 15, fontSize: 16 },
    chatAnswerBox: {
        backgroundColor: 'rgba(255, 213, 111, 0.05)',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FFD56F',
        marginTop: 10,
    },
    chatAnswerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        lineHeight: 20,
    },
});
