import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, G, Rect } from 'react-native-svg';
import { Branding } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.85;
const CELL_SIZE = CHART_SIZE / 4;

const RASI_NAMES_TAMIL = [
    'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
    'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
    'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

const RASI_MAP: any = {
    'Mesham': 0, 'Rishabam': 1, 'Midhunam': 2, 'Kadagam': 3,
    'Simmam': 4, 'Kanni': 5, 'Thulam': 6, 'Viruchigam': 7,
    'Dhanusu': 8, 'Magaram': 9, 'Kumbam': 10, 'Meenam': 11,
    // Alternative spellings
    'Aries': 0, 'Taurus': 1, 'Gemini': 2, 'Cancer': 3,
    'Leo': 4, 'Virgo': 5, 'Libra': 6, 'Scorpio': 7,
    'Sagittarius': 8, 'Capricorn': 9, 'Aquarius': 10, 'Pisces': 11,
    'Kumbham': 10
};

const GRID_MAP: any = {
    11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3],
    3: [1, 3], 4: [2, 3], 5: [3, 3], 6: [3, 2],
    7: [3, 1], 8: [3, 0], 9: [2, 0], 10: [1, 0],
};

const JathagamChart = ({ planets, type, star }: any) => {
    // Group planets by rasi
    const planetPositions: any = {};
    Object.entries(planets || {}).forEach(([planet, rasi]: any) => {
        const rasiIndex = RASI_MAP[rasi] ?? 0;
        if (!planetPositions[rasiIndex]) planetPositions[rasiIndex] = [];
        planetPositions[rasiIndex].push(planet);
    });

    return (
        <View style={styles.container}>
            <View style={styles.chartFrame}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                    {/* Outer Border */}
                    <Rect x="0" y="0" width={CHART_SIZE} height={CHART_SIZE} fill="none" stroke={Branding.gold} strokeWidth="2" />
                    
                    {/* Internal Grid Lines */}
                    {[1, 2, 3].map(i => (
                        <React.Fragment key={i}>
                            <Line x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={CHART_SIZE} stroke={Branding.gold} strokeWidth="1" opacity="0.3" />
                            <Line x1="0" y1={i * CELL_SIZE} x2={CHART_SIZE} y2={i * CELL_SIZE} stroke={Branding.gold} strokeWidth="1" opacity="0.3" />
                        </React.Fragment>
                    ))}

                    {/* Rasi Names and Planets */}
                    {Object.entries(GRID_MAP).map(([idx, [r, c]]: any) => {
                        const rasiIdx = parseInt(idx);
                        const isLagna = planetPositions[rasiIdx]?.includes('Lagna');
                        return (
                            <G key={idx} transform={`translate(${c * CELL_SIZE}, ${r * CELL_SIZE})`}>
                                {isLagna && <Rect width={CELL_SIZE} height={CELL_SIZE} fill="rgba(212, 175, 55, 0.1)" />}
                            </G>
                        );
                    })}
                </Svg>

                <View style={[StyleSheet.absoluteFill, styles.textOverlay]}>
                    {Object.entries(GRID_MAP).map(([idx, [r, c]]: any) => {
                        const rasiIdx = parseInt(idx);
                        const rasiPlanets = planetPositions[rasiIdx] || [];
                        return (
                            <View key={idx} style={[styles.cell, { top: r * CELL_SIZE, left: c * CELL_SIZE }]}>
                                <Text style={styles.rasiName}>{RASI_NAMES_TAMIL[rasiIdx]}</Text>
                                <View style={styles.planetContainer}>
                                    {rasiPlanets.map((p: string) => (
                                        <Text key={p} style={[styles.planetText, p === 'Lagna' && styles.lagnaText]}>
                                            {p === 'Lagna' ? 'L' : p.substring(0, 2)}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                    
                    <View style={styles.centerContainer}>
                        <Text style={styles.centerText}>{type}</Text>
                        <Text style={styles.centerStar}>{star}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 20 },
    chartFrame: {
        width: CHART_SIZE,
        height: CHART_SIZE,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.5)'
    },
    textOverlay: { pointerEvents: 'none' },
    cell: {
        position: 'absolute',
        width: CELL_SIZE,
        height: CELL_SIZE,
        padding: 4,
        alignItems: 'center'
    },
    rasiName: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: '300' },
    planetContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 },
    planetText: { color: '#FFF', fontSize: 11, fontWeight: '700', margin: 1 },
    lagnaText: { color: Branding.gold },
    centerContainer: {
        position: 'absolute',
        top: CELL_SIZE,
        left: CELL_SIZE,
        width: CELL_SIZE * 2,
        height: CELL_SIZE * 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    centerText: { color: Branding.gold, fontSize: 32, fontWeight: '900', opacity: 0.8 },
    centerStar: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 5, fontWeight: 'bold' }
});

export default JathagamChart;
