import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PalmScanner from '@/components/PalmScanner';
import JathagamChart from '@/components/JathagamChart';
import { palmApi } from '@/services/api';
import { Branding } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const options = { headerShown: false };

export default function PalmistryScreen() {
    const router = useRouter();
    const navigation = require('expo-router').useNavigation();
    const [loading, setLoading] = useState(false);

    require('react').useLayoutEffect(() => {
        navigation.setOptions({
            tabBarStyle: { display: 'none' }
        });
    }, [navigation]);

    const handlePalmResult = async (scanRes: any) => {
        try {
            setLoading(true);
            const base64Image = scanRes.capturedImage;

            // 1. Vision Swarm (Never-Empty Strategy)
            const VISION_SWARM = [
                "llava-hf/llava-1.5-7b-hf",
                "HuggingFaceM4/idefics2-8b"
            ];

            let aiData: any = null;

            for (const modelId of VISION_SWARM) {
                try {
                    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.EXPO_PUBLIC_HF_TOKEN || ''}`
                        },
                        body: JSON.stringify({
                            inputs: "Your name is 'Mai' (மை), a Sage Wizard. Observe this palm. Respond in TAMIL. Support your claims with traditional palmistry logic. \n Return in format: \n [SUMMARY]: \n [LIFE]: \n [HEART]: \n [HEAD]: \n [FATE]: \n [WEALTH]:",
                            image: base64Image.split('base64,')[1]
                        })
                    });

                    if (hfResponse.ok) {
                        const hfRes = await hfResponse.json();
                        const text = hfRes[0]?.generated_text || hfRes.generated_text;
                        if (text) {
                            const getTag = (tag: string) => text.split(`[${tag}]:`)[1]?.split('[')[0]?.trim() || "";
                            aiData = {
                                summary: getTag('SUMMARY') || text.slice(0, 200),
                                lifeLine: getTag('LIFE'),
                                heartLine: getTag('HEART'),
                                headLine: getTag('HEAD'),
                                fateLine: getTag('FATE'),
                                mercuryLine: getTag('WEALTH'),
                                confidence: 0.92
                            };
                            if (aiData.summary) break;
                        }
                    }
                } catch (e) { console.warn(`Vision ${modelId} skip.`); }
            }

            if (!aiData) {
                console.warn("Vision Swarm failed, switching to Backend...");
                const apiRes = await palmApi.analyze({ ...scanRes, hand_type: 'right' });
                if (apiRes.status === 'success') {
                    aiData = apiRes.data.analysis || apiRes.data;
                }
            }

            if (aiData) {
                // Navigate to Dedicated Result Screen
                router.push({
                    pathname: '/palm/result',
                    params: { 
                        analysis: JSON.stringify(aiData),
                        date: new Date().toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                        imageUrl: base64Image
                    }
                });
            }
        } catch (error) {
            console.error('Palm analysis error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: Branding.black }]}>
                <StatusBar style="light" />
                <View style={styles.loadingBox}>
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.loadingInner}>
                        <ActivityIndicator size="large" color={Branding.gold} />
                        <Text style={styles.loadingBrand}>MAI VISION</Text>
                        <Text style={styles.loadingText}>தங்களின் விதியைக் கணிக்கிறோம்...{"\n"}READING YOUR DESTINY</Text>
                    </Animated.View>
                </View>
                <View style={styles.loadingFooter}>
                    <Text style={styles.loadingFooterText}>DO NOT CLOSE THE SCANNER</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <PalmScanner
                title="Scan Your Palm"
                onResult={handlePalmResult}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 100 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingInner: { alignItems: 'center' },
    loadingBrand: { color: Branding.gold, fontSize: 12, fontWeight: '900', letterSpacing: 8, marginTop: 30, marginBottom: 10, opacity: 0.8 },
    loadingText: { color: '#FFF', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 22, letterSpacing: 1 },
    loadingFooter: { paddingHorizontal: 40 },
    loadingFooterText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    
    // Legacy result styles (rarely used now results are in result.tsx)
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' }
});
