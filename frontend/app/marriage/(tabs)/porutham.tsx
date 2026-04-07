import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { poruthamApi } from '@/services/api';
import LocationPicker from '@/components/LocationPicker';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';

export const options = { headerShown: false };

export default function PoruthamForm() {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const themeColors = Colors[colorScheme];
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // ... states ... (keeping them as is for logic)
    const [groomName, setGroomName] = useState('Vijay');
    const [brideName, setBrideName] = useState('Priya');
    const [brideDob, setBrideDob] = useState(new Date(1995, 5, 15));
    const [brideTob, setBrideTob] = useState(new Date(1995, 5, 15, 10, 30));
    const [brideLoc, setBrideLoc] = useState({ name: 'Chennai', lat: 13.0827, lon: 80.2707 });
    const [groomDob, setGroomDob] = useState(new Date(1993, 4, 10));
    const [groomTob, setGroomTob] = useState(new Date(1993, 4, 10, 11, 45));
    const [groomLoc, setGroomLoc] = useState({ name: 'Erode', lat: 11.3410, lon: 77.7171 });

    const [showBrideDatePicker, setShowBrideDatePicker] = useState(false);
    const [showBrideTimePicker, setShowBrideTimePicker] = useState(false);
    const [showGroomDatePicker, setShowGroomDatePicker] = useState(false);
    const [showGroomTimePicker, setShowGroomTimePicker] = useState(false);

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    };
    const formatTime = (date: Date) => {
        let h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${m} ${ampm}`;
    };

    const formatTime24 = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const onCheckPorutham = async () => {
        if (!groomName.trim() || !brideName.trim()) {
            alert('Please enter both names');
            return;
        }
        setLoading(true);
        try {
            const groomData = {
                name: groomName,
                dob: formatDate(groomDob),
                tob: formatTime24(groomTob),
                lat: groomLoc.lat,
                lon: groomLoc.lon,
                place: groomLoc.name
            };
            const brideData = {
                name: brideName,
                dob: formatDate(brideDob),
                tob: formatTime24(brideTob),
                lat: brideLoc.lat,
                lon: brideLoc.lon,
                place: brideLoc.name
            };

            const result = await poruthamApi.match(groomData, brideData);
            router.push({
                pathname: '/marriage/porutham_result',
                params: { result: JSON.stringify(result), groomName, brideName }
            });
        } catch (error: any) {
            alert(error.message || 'Matching failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            <StatusBar backgroundColor={Branding.gold} style="dark" />
            
            <View style={styles.stickyHeaderContainer}>
                <LinearGradient
                    colors={[Branding.black, 'transparent']}
                    style={styles.headerBackground}
                />

                <View style={[styles.header, { paddingTop: 10 }]}>
                    <View style={styles.iconBtn}>
                        <MaterialCommunityIcons name="heart-multiple" size={24} color={Branding.gold} />
                    </View>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: Branding.gold }]}>Porutham Match</Text>
                        <Text style={styles.headerSubtitle}>திருமணப் பொருத்தம்</Text>
                    </View>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/marriage/history?initialTab=marriage')}>
                        <Ionicons name="time-outline" size={24} color={Branding.gold} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

            <View style={styles.content}>

                {/* Bride Section */}
                <View style={[styles.profileCard, { borderColor: 'rgba(212, 175, 55, 0.2)' }]}>
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatarBorder, { borderColor: Branding.gold }]}>
                            <Image source={require('@/assets/images/indian_bride.png')} style={styles.avatar} />
                        </View>
                        <View style={[styles.profileText, { marginLeft: 15 }]}>
                            <Text style={[styles.roleTitle, { color: themeColors.text }]}>Bride Details</Text>
                            <Text style={styles.roleTitleTa}>பெண் விவரம்</Text>
                        </View>
                        <MaterialCommunityIcons name="face-woman-shimmer" size={24} color={Branding.gold} style={{ marginLeft: 'auto' }} />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={[styles.input, { color: themeColors.text }]} value={brideName} onChangeText={setBrideName} />
                    </View>

                    <LocationPicker
                        label="Place of Birth"
                        onLocationSelect={setBrideLoc}
                        initialValue={brideLoc.name}
                    />

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setShowBrideDatePicker(true)}>
                                <View style={styles.inputContent}>
                                    <Text style={[styles.inputText, { color: themeColors.text }]}>{formatDate(brideDob)}</Text>
                                    <Ionicons name="calendar-outline" size={18} color={Branding.gold} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Time of Birth</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setShowBrideTimePicker(true)}>
                                <View style={styles.inputContent}>
                                    <Text style={[styles.inputText, { color: themeColors.text }]}>{formatTime(brideTob)}</Text>
                                    <Ionicons name="time-outline" size={18} color={Branding.gold} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Groom Section */}
                <View style={[styles.profileCard, { borderColor: 'rgba(212, 175, 55, 0.2)' }]}>
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatarBorder, { borderColor: Branding.gold }]}>
                            <Image source={require('@/assets/images/indian_groom.png')} style={styles.avatar} />
                        </View>
                        <View style={[styles.profileText, { marginLeft: 15 }]}>
                            <Text style={[styles.roleTitle, { color: themeColors.text }]}>Groom Details</Text>
                            <Text style={styles.roleTitleTa}>ஆண் விவரம்</Text>
                        </View>
                        <MaterialCommunityIcons name="face-man-shimmer" size={24} color={Branding.gold} style={{ marginLeft: 'auto' }} />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={[styles.input, { color: themeColors.text }]} value={groomName} onChangeText={setGroomName} />
                    </View>

                    <LocationPicker
                        label="Place of Birth"
                        onLocationSelect={setGroomLoc}
                        initialValue={groomLoc.name}
                    />

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setShowGroomDatePicker(true)}>
                                <View style={styles.inputContent}>
                                    <Text style={[styles.inputText, { color: themeColors.text }]}>{formatDate(groomDob)}</Text>
                                    <Ionicons name="calendar-outline" size={18} color={Branding.gold} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Time of Birth</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setShowGroomTimePicker(true)}>
                                <View style={styles.inputContent}>
                                    <Text style={[styles.inputText, { color: themeColors.text }]}>{formatTime(groomTob)}</Text>
                                    <Ionicons name="time-outline" size={18} color={Branding.gold} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    activeOpacity={0.9}
                    onPress={onCheckPorutham}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[Branding.gold, '#B8860B']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {loading ? (
                            <ActivityIndicator color={Branding.black} />
                        ) : (
                            <View style={styles.btnContent}>
                                <Text style={styles.btnText}>Check Compatibility</Text>
                                <Ionicons name="heart" size={20} color={Branding.black} style={{ marginLeft: 8 }} />
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Pickers */}
            {showBrideDatePicker && (
                <DateTimePicker
                    value={brideDob}
                    mode="date"
                    onChange={(event, date) => {
                        setShowBrideDatePicker(false);
                        if (date) setBrideDob(date);
                    }}
                />
            )}
            {showBrideTimePicker && (
                <DateTimePicker
                    value={brideTob}
                    mode="time"
                    is24Hour={false}
                    onChange={(event, date) => {
                        setShowBrideTimePicker(false);
                        if (date) setBrideTob(date);
                    }}
                />
            )}
            {showGroomDatePicker && (
                <DateTimePicker
                    value={groomDob}
                    mode="date"
                    onChange={(event, date) => {
                        setShowGroomDatePicker(false);
                        if (date) setGroomDob(date);
                    }}
                />
            )}
            {showGroomTimePicker && (
                <DateTimePicker
                    value={groomTob}
                    mode="time"
                    onChange={(event, date) => {
                        setShowGroomTimePicker(false);
                        if (date) setGroomTob(date);
                    }}
                />
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1, backgroundColor: Branding.black },
    stickyHeaderContainer: {
        zIndex: 10,
        backgroundColor: Branding.black,
    },
    headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 10 
    },
    iconBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: 'rgba(212, 175, 55, 0.1)', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    headerTitleContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
    headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' },
    content: { padding: 20, paddingTop: 0 },
    profileCard: { 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        borderRadius: 30, 
        padding: 25, 
        marginBottom: 25, 
        borderWidth: 1, 
    },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    profileText: { flex: 1 },
    avatarBorder: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, padding: 3 },
    avatar: { width: '100%', height: '100%', borderRadius: 30 },
    roleTitle: { fontSize: 18, fontWeight: 'bold' },
    roleTitleTa: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    inputGroup: { marginBottom: 20 },
    label: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    input: { 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderWidth: 1, 
        borderColor: 'rgba(212, 175, 55, 0.1)', 
        borderRadius: 15, 
        height: 54, 
        paddingHorizontal: 18, 
        justifyContent: 'center' 
    },
    inputContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    inputText: { fontSize: 15, fontWeight: '500' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    submitBtn: { height: 60, borderRadius: 30, overflow: 'hidden', marginTop: 10 },
    btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center' },
    btnText: { color: Branding.black, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
