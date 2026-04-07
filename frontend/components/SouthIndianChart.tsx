import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, G } from 'react-native-svg';

interface GrahaPosition {
  [key: string]: {
    rasi_index: number;
    retrograde?: boolean;
  };
}

interface SouthIndianChartProps {
  houses: {
    [key: number]: {
      rasi_index: number;
      grahas: string[];
    };
  };
  lagna_rasi: number;
}

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.95;
const CELL_SIZE = CHART_SIZE / 4;

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ houses, lagna_rasi }) => {
  // Map Rasi Index to Grid (Row, Col)
  const rasiToGrid: { [key: number]: [number, number] } = {
    11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3],
    3: [1, 3], 4: [2, 3], 5: [3, 3], 6: [3, 2],
    7: [3, 1], 8: [3, 0], 9: [2, 0], 10: [1, 0],
  };

  const rasiNames: { [key: number]: string } = {
    11: 'மீனம்', 0: 'மேஷம்', 1: 'ரிஷபம்', 2: 'மிதுனம்',
    3: 'கடகம்', 4: 'சிம்மம்', 5: 'கன்னி', 6: 'துலாம்',
    7: 'விருச்சி', 8: 'தனுசு', 9: 'மகரம்', 10: 'கும்பம்',
  };

  const getGrahasForRasi = (rasiIdx: number) => {
    const house = Object.values(houses).find((h) => h.rasi_index === rasiIdx);
    return house ? house.grahas : [];
  };

  return (
    <View style={styles.container}>
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        {/* Draw Grids */}
        {[0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <Line
              x1={0}
              y1={i * CELL_SIZE}
              x2={CHART_SIZE}
              y2={i * CELL_SIZE}
              stroke="#D4AF37"
              strokeWidth="2"
            />
            <Line
              x1={i * CELL_SIZE}
              y1={0}
              x2={i * CELL_SIZE}
              y2={CHART_SIZE}
              stroke="#D4AF37"
              strokeWidth="2"
            />
          </React.Fragment>
        ))}

        {/* Labels and Grahas */}
        {Object.entries(rasiToGrid).map(([rasiIdxStr, [row, col]]) => {
          const rasiIdx = parseInt(rasiIdxStr);
          const grahas = getGrahasForRasi(rasiIdx);
          const isLagna = rasiIdx === lagna_rasi;

          return (
            <G key={rasiIdx} x={col * CELL_SIZE} y={row * CELL_SIZE}>
              <Rect
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={isLagna ? "rgba(212, 175, 55, 0.1)" : "transparent"}
              />
              {/* Rasi Label */}
              <G transform={`translate(${CELL_SIZE / 2}, 15)`}>
                {/* SVG Text support is needed or View */}
              </G>
            </G>
          );
        })}
      </Svg>

      {/* Overlay Views for better text rendering in React Native */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        {Object.entries(rasiToGrid).map(([rasiIdxStr, [row, col]]) => {
          const rasiIdx = parseInt(rasiIdxStr);
          const grahas = getGrahasForRasi(rasiIdx);
          const isLagna = rasiIdx === lagna_rasi;

          return (
            <View
              key={rasiIdx}
              style={[
                styles.cellOverlay,
                { top: row * CELL_SIZE, left: col * CELL_SIZE },
              ]}
            >
              <Text style={styles.rasiName}>{rasiNames[rasiIdx]}</Text>
              {isLagna && <Text style={styles.lagnaLabel}>லக்னம்</Text>}
              <View style={styles.grahaContainer}>
                {grahas.map((g, idx) => (
                  <Text key={idx} style={styles.grahaText}>{g}</Text>
                ))}
              </View>
            </View>
          );
        })}
        {/* Center Box */}
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>ஜாதகக் கட்டம்</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    backgroundColor: '#0A0A0A',
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  overlay: {
    pointerEvents: 'none',
  },
  cellOverlay: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rasiName: {
    color: '#666',
    fontSize: 10,
    fontWeight: '300',
  },
  lagnaLabel: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  grahaContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  grahaText: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '600',
    margin: 1,
  },
  centerBox: {
    position: 'absolute',
    top: CELL_SIZE,
    left: CELL_SIZE,
    width: CELL_SIZE * 2,
    height: CELL_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.6,
  },
});

export default SouthIndianChart;
