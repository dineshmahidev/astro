import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Branding } from '@/constants/theme';

interface LocationPickerProps {
    label: string;
    onLocationSelect: (loc: { name: string; lat: number; lon: number }) => void;
    initialValue?: string;
}

export default function LocationPicker({ label, onLocationSelect, initialValue }: LocationPickerProps) {
    const [query, setQuery] = useState(initialValue || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchLocation = async (text: string) => {
        setQuery(text);
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        setShowSuggestions(true);
        try {
            // In a real app, use a proper Places API (Google/Mapbox)
            // For now, we use expo-location's geocodeAsync for a single result or mock
            const results = await Location.geocodeAsync(text);
            if (results && results.length > 0) {
                setSuggestions(results.map((r, i) => ({
                    id: i.toString(),
                    name: text, // geocodeAsync doesn't return the full name of the result easily
                    lat: r.latitude,
                    lon: r.longitude,
                })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: any) => {
        setQuery(item.name);
        setShowSuggestions(false);
        onLocationSelect({ name: item.name, lat: item.lat, lon: item.lon });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={searchLocation}
                    placeholder="Search city..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    onFocus={() => setShowSuggestions(true)}
                />
                <Ionicons name="location-outline" size={18} color={Branding.gold} style={styles.icon} />
                {loading && <ActivityIndicator size="small" color={Branding.gold} style={styles.loader} />}
            </View>

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
                                <Ionicons name="map-outline" size={18} color="rgba(255,255,255,0.5)" />
                                <Text style={styles.suggestionText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.list}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20, zIndex: 100 },
    label: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 15, height: 54, paddingHorizontal: 15 },
    input: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500' },
    icon: { marginLeft: 10 },
    loader: { marginLeft: 10 },
    suggestionsContainer: { position: 'absolute', top: 80, left: 0, right: 0, backgroundColor: '#1a1a1a', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', maxHeight: 200, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10 },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 10 },
    suggestionText: { color: '#fff', fontSize: 14 },
    list: { width: '100%' }
});
