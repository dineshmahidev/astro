import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { firebaseAuthApi } from '@/services/firebase-api';
import { Branding } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export const options = { headerShown: false };

export default function EditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        profession: '',
        dob: '',
        tob: '',
        pob: '',
        lat: '',
        lng: '',
        avatar_url: ''
    });

    // Date & Time Picker state
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    // Location search state
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await firebaseAuthApi.getMe();
            if (data) {
                setProfile({
                    name: (data as any).name || '',
                    profession: (data as any).profession || '',
                    dob: (data as any).dob || '',
                    tob: (data as any).tob || '',
                    pob: (data as any).pob || '',
                    lat: (data as any).lat || '',
                    lng: (data as any).lng || '',
                    avatar_url: (data as any).avatar_url || ''
                });
            }
        } catch (error: any) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await firebaseAuthApi.updateProfile({
                name: profile.name,
                profession: profile.profession,
                dob: profile.dob,
                tob: profile.tob,
                pob: profile.pob,
                lat: profile.lat,
                lng: profile.lng,
                avatar_url: profile.avatar_url
            });
            Alert.alert('Cosmic Success', 'Profile synchronized with the stars successfully.', [
                { text: 'GO BACK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfile(prev => ({ ...prev, avatar_url: base64Image }));
        }
    };

    // Date Picker Handlers
    const handleConfirmDate = (date: Date) => {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setProfile(prev => ({ ...prev, dob: `${yyyy}-${mm}-${dd}` }));
        setDatePickerVisibility(false);
    };

    // Time Picker Handlers
    const handleConfirmTime = (time: Date) => {
        const t = new Date(time);
        const hh = String(t.getHours()).padStart(2, '0');
        const min = String(t.getMinutes()).padStart(2, '0');
        setProfile(prev => ({ ...prev, tob: `${hh}:${min}` }));
        setTimePickerVisibility(false);
    };

    // Location Search Logic
    const searchLocation = async (text: string) => {
        setProfile(prev => ({ ...prev, pob: text }));
        if (text.length > 2) {
            setSearchingLocation(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&addressdetails=1`);
                const data = await res.json();
                setSuggestions(data);
            } catch (e) {
                console.error('Location search error:', e);
            } finally {
                setSearchingLocation(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    const selectLocation = (item: any) => {
        // Build a shorter display name
        let shortName = item.display_name;
        if (item.address) {
            const city = item.address.city || item.address.town || item.address.village || item.address.county;
            const state = item.address.state;
            const country = item.address.country;
            if (city && country) shortName = `${city}, ${state || ''} ${country}`.replace(' ,', '');
        }

        setProfile(prev => ({
            ...prev,
            pob: shortName,
            lat: item.lat,
            lng: item.lon
        }));
        setSuggestions([]);
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
            
            {/* 1. Integrated Header */}
            <View style={[styles.header, { paddingVertical: 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Branding.gold} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Cosmic Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
            >
                {/* 2. Enhanced Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.9}>
                        <View style={styles.avatarBorder}>
                            {profile.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
                            ) : (
                                <LinearGradient colors={[Branding.gold, '#B8860B']} style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={40} color={Branding.black} />
                                </LinearGradient>
                            )}
                        </View>
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color={Branding.black} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHeader}>IDENTITY PORTRAIT</Text>
                    <Text style={styles.avatarSub}>Your digital presence in the cosmos</Text>
                </View>

                {/* 3. Personalized Identity Card */}
                <View style={styles.formCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="finger-print-outline" size={20} color={Branding.gold} />
                        <Text style={styles.cardTitle}>Identity Details</Text>
                    </View>
                    
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <TextInput
                            style={styles.textInput}
                            value={profile.name}
                            onChangeText={(txt) => setProfile(prev => ({ ...prev, name: txt }))}
                            placeholder="Enter your name"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>PROFESSION</Text>
                        <TextInput
                            style={styles.textInput}
                            value={profile.profession}
                            onChangeText={(txt) => setProfile(prev => ({ ...prev, profession: txt }))}
                            placeholder="e.g. Sage, Architect, Dreamer"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                        />
                    </View>
                </View>

                {/* 4. Temporal Alignment Card */}
                <View style={styles.formCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="time-outline" size={20} color={Branding.gold} />
                        <Text style={styles.cardTitle}>Birth Alignment</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>DATE</Text>
                            <TouchableOpacity 
                                style={styles.pickerTrigger} 
                                onPress={() => setDatePickerVisibility(true)}
                            >
                                <Text style={[styles.pickerValue, !profile.dob && { opacity: 0.3 }]}>
                                    {profile.dob || "YYYY-MM-DD"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.fieldGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>TIME</Text>
                            <TouchableOpacity 
                                style={styles.pickerTrigger} 
                                onPress={() => setTimePickerVisibility(true)}
                            >
                                <Text style={[styles.pickerValue, !profile.tob && { opacity: 0.3 }]}>
                                    {profile.tob || "HH:MM"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>LOCATION OF ORIGIN</Text>
                        <View style={styles.locationContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={profile.pob}
                                onChangeText={searchLocation}
                                placeholder="Search birth city"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                            />
                            {searchingLocation && (
                                <ActivityIndicator style={styles.inlineLoader} size="small" color={Branding.gold} />
                            )}
                            {profile.lat && !searchingLocation && suggestions.length === 0 && (
                                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.inlineLoader} />
                            )}
                        </View>

                        {/* Search Feedback Area */}
                        {suggestions.length > 0 && (
                            <View style={styles.suggestionBox}>
                                {suggestions.map((item, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.suggestionRow}
                                        onPress={() => selectLocation(item)}
                                    >
                                        <Ionicons name="location-outline" size={14} color={Branding.gold} style={{ marginTop: 2 }} />
                                        <Text style={styles.suggestionLabel} numberOfLines={1}>{item.display_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <LinearGradient
                colors={['transparent', Branding.black]}
                style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}
            >
                <TouchableOpacity 
                    style={styles.saveAction}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={[Branding.gold, '#B8860B']}
                        style={styles.saveGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color={Branding.black} />
                        ) : (
                            <Text style={styles.saveText}>COMMIT CHANGES</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisibility(false)}
                date={profile.dob ? new Date(profile.dob) : new Date(2000, 0, 1)}
            />

            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                is24Hour={false}
                onConfirm={handleConfirmTime}
                onCancel={() => setTimePickerVisibility(false)}
                date={profile.tob ? new Date(`2000-01-01T${profile.tob}:00`) : new Date()}
            />
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
        paddingBottom: 20,
    },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    
    scrollContent: { paddingHorizontal: 25 },
    
    avatarSection: { alignItems: 'center', marginVertical: 35 },
    avatarWrapper: { position: 'relative' },
    avatarBorder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: 'rgba(212,175,55,0.3)',
        padding: 5,
        backgroundColor: '#111'
    },
    avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
    avatarPlaceholder: { flex: 1, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: Branding.gold,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Branding.black
    },
    avatarHeader: { color: Branding.gold, fontSize: 13, fontWeight: '900', marginTop: 15, letterSpacing: 2 },
    avatarSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 },

    formCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 30,
        padding: 25,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
    cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    
    fieldGroup: { marginBottom: 20 },
    label: { color: Branding.gold, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 10, opacity: 0.6 },
    textInput: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212,175,55,0.2)'
    },
    row: { flexDirection: 'row' },
    pickerTrigger: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212,175,55,0.2)'
    },
    pickerValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    
    locationContainer: { position: 'relative' },
    inlineLoader: { position: 'absolute', right: 0, top: 10 },
    
    suggestionBox: {
        marginTop: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.1)'
    },
    suggestionRow: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 12
    },
    suggestionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, flex: 1 },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
        paddingTop: 30
    },
    saveAction: {
        shadowColor: Branding.gold,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10
    },
    saveGradient: {
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center'
    },
    saveText: { color: Branding.black, fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }
});
