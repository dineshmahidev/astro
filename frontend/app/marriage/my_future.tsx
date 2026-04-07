import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { predictionApi } from '@/services/api';
import { Branding, Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import Toast from '@/components/Toast';

const { width } = Dimensions.get('window');

export default function MyFutureScreen() {
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchFuture();
    }, []);

    const fetchFuture = async () => {
        try {
            const res = await predictionApi.getFuture();
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Branding.gold} />
                <Text style={styles.loaderText}>வானிலை ஆய்வு மையம்... (Calculating Future)</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Branding.black, '#1A1A1A']} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>எனது எதிர்காலம்</Text>
                <Text style={styles.subtitle}>My Future Roadmap</Text>

                {/* Fortune Graph Simulation */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>அதிர்ஷ்ட அலைவரிசை (Fortune Index)</Text>
                    <View style={styles.graphContainer}>
                        {data?.fortune_graph.map((val: number, idx: number) => (
                            <View key={idx} style={styles.barContainer}>
                                <LinearGradient 
                                    colors={[Branding.gold, '#B8860B']} 
                                    style={[styles.bar, { height: val * 1.5 }]} 
                                />
                                <Text style={styles.barLabel}>{2024 + idx}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Destiny Milestones */}
                <View style={styles.grid}>
                    {data?.milestones.map((m: any, i: number) => (
                        <View key={i} style={styles.mileCard}>
                            <MaterialCommunityIcons name={m.icon} size={30} color={Branding.gold} />
                            <Text style={styles.mileYear}>{m.year}</Text>
                            <Text style={styles.mileText}>{m.text_ta}</Text>
                            <Text style={styles.mileTextEn}>{m.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Life Chapters */}
                <Text style={styles.sectionHeaderLarge}>வாழ்க்கை அத்தியாயங்கள் (Chapters)</Text>
                {data?.chapters.map((c: any, i: number) => (
                    <View key={i} style={styles.chapterCard}>
                        <View style={styles.chapterHeader}>
                            <Text style={styles.chapterTitle}>{c.title_ta}</Text>
                            <Text style={styles.chapterRange}>{c.range}</Text>
                        </View>
                        <Text style={styles.chapterDesc}>{c.desc_ta}</Text>
                        <Text style={styles.chapterDescEn}>{c.desc}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Branding.black },
    loaderText: { color: Branding.gold, marginTop: 10, fontSize: 13 },
    scroll: { padding: 20, paddingTop: 60 },
    title: { fontSize: 32, fontWeight: 'bold', color: Branding.gold, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#AAA', textAlign: 'center', marginBottom: 30, textTransform: 'uppercase', letterSpacing: 2 },
    sectionHeader: { fontSize: 15, fontWeight: 'bold', color: Branding.gold, marginBottom: 15 },
    sectionHeaderLarge: { fontSize: 20, fontWeight: 'bold', color: Branding.gold, marginVertical: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', marginBottom: 20 },
    graphContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingTop: 20 },
    barContainer: { alignItems: 'center' },
    bar: { width: 12, borderRadius: 6 },
    barLabel: { color: '#666', fontSize: 10, marginTop: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
    mileCard: { width: (width - 60) / 3, backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
    mileYear: { color: Branding.gold, fontWeight: 'bold', fontSize: 16, marginTop: 5 },
    mileText: { color: '#FFF', fontSize: 10, textAlign: 'center', marginTop: 4 },
    mileTextEn: { color: '#777', fontSize: 9, textAlign: 'center' },
    chapterCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: Branding.gold },
    chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    chapterTitle: { color: Branding.gold, fontWeight: 'bold', fontSize: 18 },
    chapterRange: { color: '#777', fontSize: 12 },
    chapterDesc: { color: '#EEE', fontSize: 14, lineHeight: 20 },
    chapterDescEn: { color: '#777', fontSize: 12, marginTop: 5, fontStyle: 'italic' },
});
