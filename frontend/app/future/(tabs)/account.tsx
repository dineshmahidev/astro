import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
// ExpoImage handled below
import Animated, { 
    FadeInDown, 
    FadeInUp,
} from 'react-native-reanimated';
import { authApi, setToken } from '@/services/api';
import { Colors, Branding } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');

export default function FutureAccount() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [notifications, setNotifications] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const data = await authApi.getMe();
            setProfile(data);
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [fetchProfile])
    );

    const handleUpdateAvatar = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets?.[0]?.base64) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                // Pessimistic update
                setLoading(true);
                await authApi.updateProfile({ avatar_url: base64Image });
                await fetchProfile();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: Branding.black }]}>
                <ActivityIndicator size="large" color={Branding.gold} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/topup')}>
                        <Ionicons name="wallet-outline" size={18} color={Branding.gold} />
                        <Text style={styles.walletBalance}>₹ {profile?.wallet_balance || '0'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>COSMIC ARCHIVE</Text>
                    <TouchableOpacity style={styles.settingsIcon} onPress={() => {}}>
                        <Ionicons name="settings-outline" size={22} color={Branding.gold} />
                    </TouchableOpacity>
                </View>

                {/* 2. AVATAR & INFO SECTION */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.profileSection}>
                    <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8} onPress={handleUpdateAvatar}>
                        <View style={styles.avatarOuterRing}>
                            <View style={styles.avatarInner}>
                                {profile?.avatar_url ? (
                                    <ExpoImage 
                                        source={{ uri: profile.avatar_url }} 
                                        style={styles.avatarImg} 
                                    />
                                ) : (
                                    <LinearGradient colors={[Branding.gold, '#B8860B']} style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={40} color={Branding.black} style={{ opacity: 0.15, position: 'absolute' }} />
                                        <Text style={styles.avatarInitial}>{profile?.name?.charAt(0) || 'A'}</Text>
                                    </LinearGradient>
                                )}
                            </View>
                            <View style={styles.avatarEditIcon}>
                                <Ionicons name="camera" size={14} color={Branding.black} />
                            </View>
                        </View>
                        <View style={styles.proBadge}>
                            <Text style={styles.proText}>Pro</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{profile?.name || 'Astro User'}</Text>
                    <Text style={styles.userEmail}>{profile?.email || 'user@astromai.com'}</Text>
                </Animated.View>

                {/* 2. PROMO BANNER */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.bannerContainer}>
                    <LinearGradient
                        colors={[Branding.gold, '#B8860B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bannerCard}
                    >
                        <View style={styles.bannerIconBox}>
                            <Ionicons name="gift" size={24} color={Branding.black} />
                        </View>
                        <View style={styles.bannerTextBox}>
                            <Text style={styles.bannerSub}>Astro referral event</Text>
                            <Text style={styles.bannerMain}>Get free prediction slots</Text>
                        </View>
                        <View style={styles.bannerDecoration} />
                    </LinearGradient>
                </Animated.View>

                {/* 3. ACTION CHIPS */}
                <View style={styles.chipsRow}>
                    <ActionChip icon="grid-outline" label="My Path" delay={400} />
                    <ActionChip icon="bar-chart-outline" label="Daily Stats" delay={500} />
                    <ActionChip icon="document-text-outline" label="Star Report" delay={600} />
                </View>

                {/* 4. LIST ITEMS */}
                <View style={styles.listContainer}>
                    <ListItem 
                        icon="bookmark-outline" 
                        label="Bookmark" 
                        badge="2" 
                        delay={700} 
                        onPress={() => {}}
                    />
                    <ListItem 
                        icon="notifications-outline" 
                        label="Message Notification" 
                        hasSwitch 
                        switchValue={notifications}
                        onSwitchChange={setNotifications}
                        delay={800} 
                    />
                    <ListItem 
                        icon="person-outline" 
                        label="Personal Information" 
                        delay={900} 
                        onPress={() => router.push('/edit-profile')}
                    />
                    <ListItem 
                        icon="card-outline" 
                        label="Topup History" 
                        delay={1000} 
                        onPress={() => router.push('/topup')}
                    />
                    
                    <TouchableOpacity 
                        style={styles.logoutBtn} 
                        onPress={async () => {
                            await setToken(null);
                            router.replace('/login');
                        }}
                    >
                        <Text style={styles.logoutText}>Sign Out from Astro Mai</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function ActionChip({ icon, label, delay }: any) {
    return (
        <Animated.View entering={FadeInDown.delay(delay)}>
            <TouchableOpacity style={styles.chip}>
                <Ionicons name={icon} size={18} color={Branding.gold} />
                <Text style={styles.chipLabel}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

function ListItem({ icon, label, badge, hasSwitch, switchValue, onSwitchChange, delay, onPress }: any) {
    return (
        <Animated.View entering={FadeInDown.delay(delay)}>
            <TouchableOpacity 
                style={styles.listItem} 
                onPress={onPress} 
                activeOpacity={hasSwitch ? 1 : 0.7}
                disabled={hasSwitch}
            >
                <View style={styles.itemLeftBox}>
                    <View style={styles.itemIconContainer}>
                        <Ionicons name={icon} size={20} color={Branding.gold} />
                    </View>
                    <Text style={styles.itemLabel}>{label}</Text>
                </View>
                
                <View style={styles.itemRightBox}>
                    {badge && (
                        <View style={styles.badgeCircle}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    )}
                    {hasSwitch ? (
                        <Switch 
                            value={switchValue} 
                            onValueChange={onSwitchChange}
                            trackColor={{ false: '#333', true: Branding.gold }}
                            thumbColor={Platform.OS === 'ios' ? undefined : (switchValue ? '#FFF' : '#AAA')}
                        />
                    ) : (
                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    centered: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 50 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: 10,
        height: 60,
    },
    walletBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212,175,55,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.15)',
        gap: 6
    },
    walletBalance: {
        color: Branding.gold,
        fontSize: 13,
        fontWeight: 'bold'
    },
    headerTitle: { color: Branding.gold, fontSize: 13, fontWeight: '900', letterSpacing: 3 },
    settingsIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: Branding.black,
        position: 'relative'
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15
    },
    avatarOuterRing: {
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 1.5,
        borderColor: Branding.gold,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    avatarInner: {
        width: 88,
        height: 88,
        borderRadius: 44,
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarInitial: { color: Branding.black, fontSize: 32, fontWeight: 'bold' },
    avatarEditIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: Branding.gold,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Branding.black,
        zIndex: 15
    },
    proBadge: {
        position: 'absolute',
        bottom: -5,
        alignSelf: 'center',
        backgroundColor: Branding.gold,
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 10,
        elevation: 10,
        shadowColor: Branding.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5
    },
    proText: { color: Branding.black, fontSize: 12, fontWeight: 'bold' },
    userName: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: '500' },
    
    bannerContainer: { paddingHorizontal: 20, marginBottom: 20 },
    bannerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 25,
        position: 'relative',
        overflow: 'hidden'
    },
    bannerIconBox: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    bannerTextBox: { flex: 1 },
    bannerSub: { fontSize: 11, color: 'rgba(10,10,10,0.6)', fontWeight: 'bold', textTransform: 'uppercase' },
    bannerMain: { fontSize: 16, color: Branding.black, fontWeight: '900', marginTop: 2 },
    bannerDecoration: {
        position: 'absolute',
        right: 0,
        top: 25,
        bottom: 25,
        width: 4,
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 2
    },

    chipsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20,
        marginBottom: 25 
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)'
    },
    chipLabel: { fontSize: 12, color: Branding.gold, fontWeight: 'bold', marginLeft: 6 },

    listContainer: { paddingHorizontal: 20 },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 22,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)'
    },
    itemLeftBox: { flexDirection: 'row', alignItems: 'center' },
    itemIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    itemLabel: { fontSize: 15, fontWeight: '700', color: '#EEE' },
    itemRightBox: { flexDirection: 'row', alignItems: 'center' },
    badgeCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Branding.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    badgeText: { fontSize: 11, fontWeight: '900', color: Branding.black },
    
    logoutBtn: {
        marginTop: 10,
        marginBottom: 40,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 111, 111, 0.05)',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255, 111, 111, 0.1)'
    },
    logoutText: { color: '#FF6F6F', fontSize: 16, fontWeight: 'bold' }
});
