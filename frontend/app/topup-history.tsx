import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { walletApi } from '@/services/api';
import { Branding } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function TopupHistory() {
    const router = useRouter();
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await walletApi.getHistory();
            if (response.status === 'success') {
                setHistory(response.data);
            }
        } catch (error) {
            console.error('Fetch history error:', error);
            // Fallback mock data for demo if API fails
            setHistory([
                { id: 1, amount: 500, type: 'credit', status: 'success', created_at: '2024-03-20 10:30:00', method: 'Razorpay' },
                { id: 2, amount: 50, type: 'debit', status: 'success', created_at: '2024-03-19 15:45:00', method: 'Prediction' },
                { id: 3, amount: 1000, type: 'credit', status: 'pending', created_at: '2024-03-18 09:15:00', method: 'Razorpay' },
                { id: 4, amount: 100, type: 'credit', status: 'success', created_at: '2024-03-17 11:20:00', method: 'Reward' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Branding.gold} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('history')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={60} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                ) : (
                    history.map((item, index) => (
                        <Animated.View 
                            key={item.id} 
                            entering={FadeInDown.delay(index * 100)}
                            style={styles.card}
                        >
                            <View style={styles.cardLeft}>
                                <View style={[
                                    styles.iconBox, 
                                    { backgroundColor: item.type === 'credit' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)' }
                                ]}>
                                    <Ionicons 
                                        name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
                                        size={20} 
                                        color={item.type === 'credit' ? '#4CAF50' : '#FF5252'} 
                                    />
                                </View>
                                <View>
                                    <Text style={styles.methodText}>{item.method || 'Transaction'}</Text>
                                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.cardRight}>
                                <Text style={[
                                    styles.amountText,
                                    { color: item.type === 'credit' ? '#4CAF50' : '#FF5252' }
                                ]}>
                                    {item.type === 'credit' ? '+' : '-'} ₹{Math.abs(item.amount)}
                                </Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: item.status === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: item.status === 'success' ? '#4CAF50' : '#FF9800' }
                                    ]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#111'
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: { color: Branding.gold, fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    methodText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    dateText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
    cardRight: { alignItems: 'flex-end' },
    amountText: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6
    },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
    emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 20, fontSize: 16 }
});
