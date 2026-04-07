import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import PalmScanner from '@/components/PalmScanner';
import { Colors, Branding } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { authApi, palmApi } from '@/services/api';

export default function FuturePalm() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        authApi.getMe().then(setUser).catch(console.error);
    }, []);

    const handleResult = async (res: any) => {
        if (!res.success) return;
        
        try {
            setLoading(true);
            // 1. Send to Python AI Processor
            const analysis = await palmApi.analyze({
                capturedImage: res.capturedImage,
                user_id: user?.id
            });

            if (analysis.success) {
                // 2. Format results from Python's Dynamic Brain
                const pyAnalysis = analysis.analysis;
                const resultData = {
                    confidence: 0.95,
                    summary: pyAnalysis.summary,
                    lifeLine: pyAnalysis.life,
                    heartLine: pyAnalysis.heart,
                    headLine: pyAnalysis.head
                };

                router.push({
                    pathname: '/palm/result',
                    params: {
                        analysis: JSON.stringify(resultData),
                        imageUrl: analysis.processed_image, 
                        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    }
                });
            } else {
                Alert.alert('Analysis Failed', analysis.error || 'Divine vision clouded. Please try again.');
            }
        } catch (error) {
            console.error('Palm analysis error:', error);
            Alert.alert('Connection Error', 'Unable to reach the Divine Processor. Verify your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Branding.gold} />
                </View>
            )}
            <PalmScanner
                title="MAI VISION • FUTURE"
                onResult={handleResult}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
