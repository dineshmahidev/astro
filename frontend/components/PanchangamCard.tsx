import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Branding } from '@/constants/theme';

interface PanchangamItemProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}

export function PanchangamItem({ label, value, icon }: PanchangamItemProps) {
    return (
        <View style={styles.item}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={18} color={Branding.gold} />
            </View>
            <View>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
}

export default function PanchangamCard({ data }: { data?: any }) {
    if (!data) return null;

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Dynamic Panchangam</Text>
            <View style={styles.grid}>
                <PanchangamItem label="Tithi" value={data.tithi || 'Shukla Navami'} icon="moon" />
                <PanchangamItem label="Nakshatra" value={data.nakshatra || 'Rohini'} icon="star" />
                <PanchangamItem label="Yoga" value={data.yoga || 'Siddha'} icon="flash" />
                <PanchangamItem label="Karana" value={data.karana || 'Balava'} icon="leaf" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        marginVertical: 10,
    },
    title: {
        color: Branding.gold,
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 15,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    label: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    value: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
});
