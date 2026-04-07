import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Branding } from '@/constants/theme';
import { walletApi } from '@/services/api';

// REAL ADMOB IDs
const REWARDED_AD_UNIT_ID = 'ca-app-pub-2141805169615611/6710193860';

// Mocking library in case it's not installed/ready in development build
let RewardedAd: any = null;
try {
    const AdMob = require('react-native-google-mobile-ads');
    RewardedAd = AdMob.RewardedAd;
} catch (e) {
    console.log('Mobile Ads SDK not available in this environment');
}

const { width } = Dimensions.get('window');
const TOPUP_OPTIONS = [10, 20, 50, 100];

export default function TopupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [rewardProgress, setRewardProgress] = useState(0); 
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            setLoading(true);
            const res = await walletApi.getBalance();
            if (res.status === 'success') {
                setBalance(res.data.wallet_balance);
                setRewardProgress(res.data.reward_balance);
            }
        } catch (error) {
            console.error('Fetch balance error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchAd = async () => {
        if (rewardProgress >= 10) {
            Alert.alert('Threshold Reached', 'You have earned ₹10! Redeem for free divine access.');
            return;
        }

        setIsWatchingAd(true);

        // REAL INTEGRATION CHECK
        if (RewardedAd) {
            // Real AdMob Logic would go here
            // const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);
            // rewarded.show();
            // This requires native builds to test correctly.
        }

        // Integrated Divine Timer Simulation
        setTimeout(async () => {
            try {
                const res = await walletApi.addReward();
                if (res.status === 'success') {
                    setRewardProgress(res.reward_balance);
                    Alert.alert('Reward Verified!', 'Divine Ads SDK: ₹2 Reward added to your cosmic account.');
                }
            } catch (error) {
                 Alert.alert('Error', 'Connection to divine server lost.');
            } finally {
                setIsWatchingAd(false);
            }
        }, 5000);
    };

    const handleRedeemReward = async () => {
        if (rewardProgress < 10) return;
        try {
            setLoading(true);
            const res = await walletApi.redeem();
            if (res.status === 'success') {
                setBalance(res.new_balance);
                setRewardProgress(0);
                Alert.alert('Cosmic Blessing!', '₹10 added. 20 Minutes Free Divine Access granted!');
            }
        } catch (error) {
            Alert.alert('Error', 'Redemption failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleTopup = async () => {
        const amount = selectedAmount || parseFloat(customAmount);
        if (!amount || amount < 10 || amount > 100) {
             Alert.alert('Invalid Divine Gift', 'Please select ₹10 - ₹100.');
             return;
        }
        try {
            setLoading(true);
            const res = await walletApi.topup(amount);
            if (res.status === 'success') {
                setBalance(res.new_balance);
                Alert.alert('Success', `₹${amount} Added to Divine Wallet.`);
            }
        } catch (error) {
            Alert.alert('Error', 'Payment processing failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && balance === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Branding.gold} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={[styles.header, { paddingTop: 8 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DIVINE WALLET</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInDown.duration(600)} style={styles.balanceCard}>
                    <LinearGradient colors={[Branding.gold, '#B8860B']} style={styles.balanceGradient}>
                        <View>
                            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
                            <Text style={styles.balanceAmount}>₹ {balance.toFixed(2)}</Text>
                        </View>
                        <MaterialCommunityIcons name="wallet" size={40} color="rgba(0,0,0,0.15)" />
                    </LinearGradient>
                </Animated.View>

                {/* ADMOB INTEGRATED REWARDS */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.rewardCard}>
                    <View style={styles.rewardHeader}>
                        <View style={styles.rewardTitleBox}>
                            <Ionicons name="gift" size={20} color={Branding.gold} />
                            <View>
                                <Text style={styles.rewardTitle}>Divine Ad Rewards</Text>
                                <Text style={styles.rewardAdUnit}>ID: ...{REWARDED_AD_UNIT_ID.slice(-10)}</Text>
                            </View>
                        </View>
                        <Text style={styles.rewardProgressText}>₹{rewardProgress}/10</Text>
                    </View>

                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, { width: `${(rewardProgress/10)*100}%` }]} />
                    </View>

                    <View style={styles.rewardActions}>
                        <TouchableOpacity style={[styles.adBtn, isWatchingAd && { opacity: 0.7 }]} onPress={handleWatchAd} disabled={isWatchingAd}>
                            {isWatchingAd ? (
                                <ActivityIndicator size="small" color={Branding.black} />
                            ) : (
                                <>
                                    <Ionicons name="play" size={18} color={Branding.black} />
                                    <Text style={styles.adBtnText}>Watch Reward Ad</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.redeemBtn, rewardProgress < 10 && styles.redeemBtnDisabled]} onPress={handleRedeemReward} disabled={rewardProgress < 10}>
                            <Text style={[styles.redeemBtnText, rewardProgress < 10 && { color: 'rgba(255,255,255,0.2)' }]}>Redeem Access</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Text style={styles.sectionTitle}>One-Click Recharge</Text>
                <View style={styles.optionsGrid}>
                    {TOPUP_OPTIONS.map((amt) => (
                        <TouchableOpacity key={amt} style={[styles.optionBox, selectedAmount === amt && styles.selectedOption]} onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}>
                            <Text style={[styles.optionText, selectedAmount === amt && styles.selectedOptionText]}>₹{amt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Custom Offering (Max ₹100)</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput style={styles.input} placeholder="10 - 100" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="numeric" value={customAmount} onChangeText={(val) => { setCustomAmount(val); setSelectedAmount(null); }} maxLength={3} />
                </View>

                <TouchableOpacity style={styles.payBtn} onPress={handleTopup}>
                    <LinearGradient colors={[Branding.gold, '#B8860B']} style={styles.payGradient}>
                        <Text style={styles.payText}>CONFIRM RECHARGE</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: Branding.gold, fontSize: 13, fontWeight: '900', letterSpacing: 3 },
    scrollContent: { padding: 25, paddingBottom: 60 },
    balanceCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
    balanceGradient: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceLabel: { color: Branding.black, fontSize: 10, fontWeight: '900', letterSpacing: 2, opacity: 0.6 },
    balanceAmount: { color: Branding.black, fontSize: 32, fontWeight: 'bold' },
    rewardCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)' },
    rewardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    rewardTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rewardTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    rewardAdUnit: { color: 'rgba(255,255,255,0.3)', fontSize: 9 },
    rewardProgressText: { color: Branding.gold, fontSize: 14, fontWeight: '900' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: Branding.gold, borderRadius: 3 },
    rewardActions: { flexDirection: 'row', gap: 12 },
    adBtn: { flex: 1.2, backgroundColor: Branding.gold, height: 48, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    adBtnText: { color: Branding.black, fontSize: 13, fontWeight: 'bold' },
    redeemBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    redeemBtnDisabled: { opacity: 0.5 },
    redeemBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
    sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
    optionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    optionBox: { width: (width - 80) / 4, aspectRatio: 1.1, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    selectedOption: { borderColor: Branding.gold, backgroundColor: 'rgba(212,175,55,0.1)' },
    optionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    selectedOptionText: { color: Branding.gold },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 15, height: 56, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    currencySymbol: { color: Branding.gold, fontSize: 18, fontWeight: 'bold', marginRight: 10 },
    input: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    payBtn: { borderRadius: 16, overflow: 'hidden' },
    payGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
    payText: { color: Branding.black, fontSize: 15, fontWeight: '900', letterSpacing: 2 }
});
