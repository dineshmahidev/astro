import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Branding } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function PalmScanner({ title, onResult }: { title?: string, onResult: (result: any) => void }) {
    const insets = useSafeAreaInsets();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scanLinePos = useSharedValue(0);
    const cameraRef = React.useRef<any>(null);
    const [capturing, setCapturing] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [flash, setFlash] = useState<'off' | 'on'>('off');

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();

        const AREA_HEIGHT = (width * 0.8) / 0.65;
        scanLinePos.value = withRepeat(
            withTiming(AREA_HEIGHT - 60, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
        );
    }, []);

    const takePicture = async () => {
        if (cameraRef.current && !capturing && isCameraReady) {
            try {
                setCapturing(true);
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                    quality: 0.1, // Ultra-compression for maximum stability
                    imageType: 'jpg',
                });
                
                onResult({
                    capturedImage: `data:image/jpeg;base64,${photo.base64}`,
                    success: true
                });
            } catch (error) {
                console.error('Take picture error:', error);
            } finally {
                setCapturing(false);
            }
        }
    };

    const pickImage = async () => {
        try {
            setCapturing(true);
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.2,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0].base64) {
                onResult({
                    capturedImage: `data:image/jpeg;base64,${result.assets[0].base64}`,
                    success: true
                });
            }
        } catch (error) {
            console.error('Pick image error:', error);
        } finally {
            setCapturing(false);
        }
    };

    const animatedLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLinePos.value }]
    }));

    if (hasPermission === null) return <View />;
    if (hasPermission === false) return <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 100 }}>No access to camera</Text>;

    return (
        <View style={styles.container}>
            <CameraView 
                ref={cameraRef} 
                style={styles.camera} 
                facing="back"
                enableTorch={flash === 'on'}
                onCameraReady={() => setIsCameraReady(true)}
            >
                {/* 1. Immersive Glass Overlay */}
                <View style={[styles.overlay, { 
                    paddingTop: insets.top + 40,
                    paddingBottom: Math.max(insets.bottom, 20) + 40
                }]}>
                    <View style={styles.topBar}>
                        <Text style={styles.brandText}>MAI VISION</Text>
                        <Text style={styles.instruction}>{title || 'Align Palm with Guides'}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }} />
                    
                    {/* 3. Modern Control Hub (Glassmorphism) */}
                    <View style={styles.controlHub}>
                         <TouchableOpacity 
                            style={styles.secondaryBtn} 
                            onPress={() => setFlash(prev => prev === 'off' ? 'on' : 'off')}
                        >
                            <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={22} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.mainCaptureBtn, capturing && { opacity: 0.5 }]} 
                            onPress={takePicture}
                            disabled={capturing || !isCameraReady}
                        >
                            <View style={styles.outerRing}>
                                <LinearGradient colors={[Branding.gold, '#B8860B']} style={styles.captureGradient}>
                                    {capturing ? (
                                        <ActivityIndicator color={Branding.black} />
                                    ) : (
                                        <Ionicons name="scan-outline" size={32} color={Branding.black} />
                                    )}
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.secondaryBtn} 
                            onPress={pickImage}
                            disabled={capturing}
                        >
                            <Ionicons name="image-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    overlay: { 
        flex: 1, 
        backgroundColor: 'transparent', 
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBar: { alignItems: 'center' },
    brandText: { color: Branding.gold, fontSize: 10, fontWeight: '900', letterSpacing: 5, marginBottom: 8, opacity: 0.8 },
    instruction: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center', paddingHorizontal: 40 },
    
    scanWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    scanRegion: {
        width: width * 0.8,
        aspectRatio: 0.65,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderRadius: 50,
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        position: 'relative',
        overflow: 'hidden',
    },
    cornerTL: { position: 'absolute', top: 25, left: 25, width: 45, height: 45, borderTopWidth: 5, borderLeftWidth: 5, borderColor: Branding.gold, borderTopLeftRadius: 25 },
    cornerTR: { position: 'absolute', top: 25, right: 25, width: 45, height: 45, borderTopWidth: 5, borderRightWidth: 5, borderColor: Branding.gold, borderTopRightRadius: 25 },
    cornerBL: { position: 'absolute', bottom: 25, left: 25, width: 45, height: 45, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: Branding.gold, borderBottomLeftRadius: 25 },
    cornerBR: { position: 'absolute', bottom: 25, right: 25, width: 45, height: 45, borderBottomWidth: 5, borderRightWidth: 5, borderColor: Branding.gold, borderBottomRightRadius: 25 },
    
    scanLine: { 
        width: '100%', 
        height: 60, // Trail height
        position: 'absolute', 
    },
    
    controlHub: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        paddingHorizontal: 40,
        marginTop: 10, // Buffer
    },
    mainCaptureBtn: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    outerRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        padding: 5,
    },
    captureGradient: { 
        flex: 1, 
        borderRadius: 45, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: Branding.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    secondaryBtn: { 
        width: 54, 
        height: 54, 
        borderRadius: 27, 
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});
