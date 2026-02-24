import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { calcDistance } from '../utils/spots';
import { calcBurnedCalories } from '../utils/calorieCalc';

const METS_WALKING = 3.5;
const USER_WEIGHT = 70; // 仮（後でContextから取得）

export default function MapScreen() {
  const params = useLocalSearchParams();
  const destLat = parseFloat(params.destLat);
  const destLng = parseFloat(params.destLng);
  const destName = params.destName;
  const spots = params.spots ? JSON.parse(params.spots) : [];

  const [location, setLocation] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null); // 選択された経由地
  const [routeCoords, setRouteCoords] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [burnedCalories, setBurnedCalories] = useState(0);
  const watchRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { alert('位置情報の許可が必要です'); return; }
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    })();
  }, []);

  const startTracking = async () => {
    setTracking(true);
    setRouteCoords([]);
    setTotalDistance(0);
    setBurnedCalories(0);

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setRouteCoords(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = calcDistance(last.latitude, last.longitude, latitude, longitude);
            setTotalDistance(d => {
              const newDist = d + dist;
              // 消費カロリーを更新（距離→時間→カロリー）
              const hours = (newDist / 1000) / 4;
              setBurnedCalories(Math.round(calcBurnedCalories(METS_WALKING, hours, USER_WEIGHT)));
              return newDist;
            });
          }
          return [...prev, { latitude, longitude }];
        });
        mapRef.current?.animateToRegion({
          latitude, longitude,
          latitudeDelta: 0.005, longitudeDelta: 0.005,
        });
      }
    );
  };

  const stopTracking = () => {
    watchRef.current?.remove();
    setTracking(false);
  };

  if (!location) {
    return <View style={styles.loading}><Text>現在地を取得中...</Text></View>;
  }

  // ルート選択前の画面
  if (!selectedSpot) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>寄り道ルートを選んでください</Text>
        <Text style={styles.subtitle}>目的地：{destName}</Text>

        <ScrollView style={styles.spotList}>
          {spots.map((spot, index) => (
            <TouchableOpacity
              key={index}
              style={styles.spotButton}
              onPress={() => setSelectedSpot(spot)}
            >
              <View style={styles.spotHeader}>
                <Text style={styles.spotRoute}>ルート {index + 1}</Text>
                <Text style={styles.spotDistance}>
                  約 {(spot.totalDistance / 1000).toFixed(1)} km
                </Text>
              </View>
              <Text style={styles.spotName}>📍 {spot.name}</Text>
              <Text style={styles.spotDifficulty}>
                {'⭐'.repeat(index + 1)} {'難易度'.repeat(1)}{['低', '中', '高'][index]}
              </Text>
            </TouchableOpacity>
          ))}

          {spots.length === 0 && (
            <Text style={styles.noSpots}>
              近くに寄り道スポットが見つかりませんでした。{'\n'}
              目的地までの直線ルートで進んでください。
            </Text>
          )}
        </ScrollView>

        {/* 候補なしでも目的地へ直接進めるボタン */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => setSelectedSpot({ name: destName, lat: destLat, lng: destLng, skip: true })}
        >
          <Text style={styles.skipButtonText}>寄り道せずに目的地へ →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ルート選択後のマップ画面
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* 現在地 */}
        <Marker coordinate={location} title="現在地" pinColor="blue" />

        {/* 経由地（寄り道スポット） */}
        {!selectedSpot.skip && (
          <Marker
            coordinate={{ latitude: selectedSpot.lat, longitude: selectedSpot.lng }}
            title={selectedSpot.name}
            pinColor="orange"
          />
        )}

        {/* 目的地 */}
        <Marker
          coordinate={{ latitude: destLat, longitude: destLng }}
          title={destName}
          pinColor="red"
        />

        {/* 移動ルート */}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="#4CAF50" strokeWidth={4} />
        )}
      </MapView>

      {/* 情報パネル */}
      <View style={styles.panel}>
        {!selectedSpot.skip && (
          <Text style={styles.waypointText}>経由地：{selectedSpot.name}</Text>
        )}
        <Text style={styles.distanceText}>
          総移動距離　<Text style={styles.distanceNumber}>{(totalDistance / 1000).toFixed(2)}</Text> km
        </Text>
        {tracking && (
          <Text style={styles.calorieText}>
            消費カロリー　<Text style={styles.calorieNumber}>{burnedCalories}</Text> kcal
          </Text>
        )}
        <TouchableOpacity
          style={[styles.trackButton, tracking && styles.stopButton]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <Text style={styles.trackButtonText}>
            {tracking ? '⏹ トラッキングを終える' : '▶ トラッキング開始'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 60, marginHorizontal: 24 },
  subtitle: { fontSize: 14, color: '#888', marginHorizontal: 24, marginTop: 4, marginBottom: 16 },
  spotList: { flex: 1, paddingHorizontal: 24 },
  spotButton: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 12, gap: 8 },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spotRoute: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  spotDistance: { fontSize: 14, color: '#888' },
  spotName: { fontSize: 15, color: '#333' },
  spotDifficulty: { fontSize: 13, color: '#FF9800' },
  noSpots: { textAlign: 'center', color: '#888', marginTop: 48, lineHeight: 24 },
  skipButton: { margin: 24, padding: 16, alignItems: 'center' },
  skipButtonText: { color: '#888', fontSize: 14 },
  map: { flex: 1 },
  panel: { padding: 24, backgroundColor: 'white', gap: 8, alignItems: 'center' },
  waypointText: { fontSize: 14, color: '#FF9800' },
  distanceText: { fontSize: 16, color: '#333' },
  distanceNumber: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  calorieText: { fontSize: 16, color: '#333' },
  calorieNumber: { fontSize: 32, fontWeight: 'bold', color: '#FF5722' },
  trackButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, width: 240, alignItems: 'center', marginTop: 8 },
  stopButton: { backgroundColor: '#FF5722' },
  trackButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});