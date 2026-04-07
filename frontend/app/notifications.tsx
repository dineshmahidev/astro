import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Branding } from '@/constants/theme';
import { notificationApi } from '@/services/api';

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationApi.getAll();
            if (res.status === 'success') {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error('Mark all read error:', error);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Mark read error:', error);
        }
    };

    const renderNotification = (item: any, index: number) => (
        <Animated.View 
            entering={FadeInDown.delay(index * 100).duration(500)} 
            key={item.id.toString()} 
            style={[styles.notificationCard, item.is_read ? { opacity: 0.6 } : null]}
        >
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleMarkRead(item.id)}
                style={{ flexDirection: 'row', flex: 1 }}
            >
                <View style={[styles.iconBox, { backgroundColor: `${item.color || Branding.gold}20` }]}>
                    <Ionicons name={item.icon || 'notifications'} size={24} color={item.color || Branding.gold} />
                </View>
                <View style={styles.contentBox}>
                    <View style={styles.notifHeader}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifTime}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text style={styles.notifDesc} numberOfLines={2}>{item.description}</Text>
                    {!item.is_read && (
                        <View style={styles.unreadBadge} />
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <View style={styles.container}>
            {/* Immersive Header */}
            <LinearGradient colors={['rgba(212,175,55,0.1)', 'transparent']} style={[styles.header, { paddingTop: 4 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleBox}>
                    <Text style={styles.headerSubtitle}>DIVINE ALERTS</Text>
                    <Text style={styles.headerTitle}>Cosmic Updates</Text>
                </View>
                <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
                    <Ionicons name="checkmark-done" size={24} color={Branding.gold} />
                </TouchableOpacity>
            </LinearGradient>

            {loading && !refreshing ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator color={Branding.gold} size="large" />
                </View>
            ) : (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
                            tintColor={Branding.gold}
                        />
                    }
                >
                    {notifications.length > 0 ? (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Messages</Text>
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount} NEW</Text>
                                    </View>
                                )}
                            </View>

                            {notifications.map((item, idx) => renderNotification(item, idx))}
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="auto-fix" size={60} color="rgba(255,255,255,0.05)" />
                            <Text style={styles.footerText}>You are all caught up with the universe.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Branding.black },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 25, 
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212,175,55,0.1)'
    },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitleBox: { alignItems: 'center' },
    headerSubtitle: { color: Branding.gold, fontSize: 10, fontWeight: '900', letterSpacing: 4, marginBottom: 4 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    markReadBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

    scrollContent: { padding: 25, paddingBottom: 100 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
    badge: { backgroundColor: Branding.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: Branding.black, fontSize: 10, fontWeight: 'bold' },

    notificationCard: { 
        flexDirection: 'row', 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 24, 
        padding: 16, 
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    iconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    contentBox: { flex: 1, marginLeft: 16, position: 'relative' },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    notifTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
    notifTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
    notifDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 20 },
    
    unreadBadge: {
        position: 'absolute',
        top: 2,
        right: -8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Branding.gold
    },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 15, textAlign: 'center' }
});
