import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Branding } from '@/constants/theme';
import { authApi } from '@/services/api';

export default function HistoryScreen() {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await authApi.getHistory();
                if (res.status === 'success') {
                    setHistory(res.data);
                }
            } catch (error) {
                console.error('History fetch failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.resultText}>{item.result}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: Branding.black }}>
            <Stack.Screen options={{ 
                headerShown: true, 
                title: 'Activity History',
                headerTransparent: true,
                headerTintColor: '#FFF',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={Branding.gold} />
                    </TouchableOpacity>
                )
            }} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Branding.gold} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: 'rgba(255,255,255,0.4)' }}>No history found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { padding: 20, paddingTop: 110 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 20, 
        padding: 20, 
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typeBadge: { backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { color: Branding.gold, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    dateText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    titleText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    resultText: { color: Branding.gold, fontSize: 14, marginTop: 5, fontWeight: '600' }
});
