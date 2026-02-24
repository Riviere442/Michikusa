import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, router } from 'expo-router';
import { calcDistance } from '../utils/spots';
import { calcBurnedCalories } from '../utils/calorieCalc';
import { fetchRouteCoordinates } from '../utils/routes';
import { useUser } from '../contexts/UserContext';
import { DEV_DATA } from '../components/DevSkipButton';

const METS_WALKING = 3.5;

export default function MapScreen() {
  const { userData } = useUser();
  const u = userData.gender ? userData : DEV_DATA;
  const userWeight = parseFloat(u.weight);

  const params = useLocalSearchParams();
  const destLat = parseFloat(params.destLat);
  const destLng = parseFloat(params.destLng);
  const destName = params.destName;
  const spots = params.spots ? JSON.parse(params.spots) : [];

  const [location, setLocation] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [plannedRoute, setPlannedRoute] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [burnedCalories, setBurnedCalories] = useState(0);
  const watchRef = useRef(null);
  const mapRef = useRef(null);

  // 現在地取得
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { alert('位置情報の許可が必要です'); return; }
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    })();
  }, []);

  // ルート選択後に Routes API で道路ベースのルートを取得
  useEffect(() => {
    if (!location || !selectedSpot) return;

    const loadRoute = async () => {
      setRouteLoading(true);
      setPlannedRoute([]);
      try {
        const origin = { latitude: location.latitude, longitude: location.longitude };
        const destination = { latitude: destLat, longitude: destLng };
        const intermediates = selectedSpot.skip
          ? []
          : [{ latitude: selectedSpot.lat, longitude: selectedSpot.lng }];

        const coords = await fetchRouteCoordinates(origin, destination, intermediates);
        setPlannedRoute(coords);

        if (coords.length > 0 && mapRef.current) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 80, right: 60, bottom: 220, left: 60 },
            animated: true,
          });
        }
      } catch (e) {
        console.error('ルート取得エラー:', e);
        const fallback = selectedSpot.skip
          ? [
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: destLat, longitude: destLng },
            ]
          : [
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: selectedSpot.lat, longitude: selectedSpot.lng },
              { latitude: destLat, longitude: destLng },
            ];
        setPlannedRoute(fallback);
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(fallback, {
            edgePadding: { top: 80, right: 60, bottom: 220, left: 60 },
            animated: true,
          });
        }
      } finally {
        setRouteLoading(false);
      }
    };

    loadRoute();
  }, [location, selectedSpot, destLat, destLng]);

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
              const hours = (newDist / 1000) / 4;
              setBurnedCalories(Math.round(calcBurnedCalories(METS_WALKING, hours, userWeight)));
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

    router.push({
      pathname: '/result',
      params: {
        totalDistance: totalDistance.toString(),
        burnedCalories: burnedCalories.toString(),
        destName: destName || '',
        waypointName: selectedSpot && !selectedSpot.skip ? selectedSpot.name : '',
      },
    });
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
        <Marker coordinate={location} title="現在地" pinColor="blue" />

        {!selectedSpot.skip && (
          <Marker
            coordinate={{ latitude: selectedSpot.lat, longitude: selectedSpot.lng }}
            title={selectedSpot.name}
            pinColor="orange"
          />
        )}

        <Marker
          coordinate={{ latitude: destLat, longitude: destLng }}
          title={destName}
          pinColor="red"
        />

        {plannedRoute.length > 1 && !tracking && (
          <Polyline
            coordinates={plannedRoute}
            strokeColor="#90CAF9"
            strokeWidth={5}
            lineDashPattern={[8, 6]}
          />
        )}

        {tracking && plannedRoute.length > 1 && (
          <Polyline
            coordinates={plannedRoute}
            strokeColor="rgba(144,202,249,0.4)"
            strokeWidth={4}
            lineDashPattern={[8, 6]}
          />
        )}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="#4CAF50" strokeWidth={4} />
        )}
      </MapView>

      {routeLoading && (
        <View style={styles.routeLoadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#333', marginTop: 8 }}>ルートを取得中...</Text>
        </View>
      )}

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
  routeLoadingOverlay: {
    position: 'absolute', top: '45%', alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', padding: 24,
    borderRadius: 16, alignItems: 'center',
  },
});