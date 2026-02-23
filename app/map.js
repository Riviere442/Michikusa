import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState(null);       // 現在地
  const [routeCoords, setRouteCoords] = useState([]);   // 移動ルートの座標列
  const [tracking, setTracking] = useState(false);      // トラッキング中かどうか
  const [totalDistance, setTotalDistance] = useState(0); // 総移動距離(m)
  const watchRef = useRef(null);  // 位置情報の監視を止めるために保持
  const mapRef = useRef(null);

  // 起動時に現在地を取得
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('位置情報の許可が必要です');
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    })();
  }, []);

  // トラッキング開始
  const startTracking = async () => {
    setTracking(true);
    setRouteCoords([]);
    setTotalDistance(0);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,   // 3秒ごと
        distanceInterval: 5,  // 5m以上動いたら更新
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;

        setRouteCoords(prev => {
          // 前の座標との距離を計算して加算
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = calcDistance(last.latitude, last.longitude, latitude, longitude);
            setTotalDistance(d => d + dist);
          }
          return [...prev, { latitude, longitude }];
        });

        // 地図を現在地に追従
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    );
  };

  // トラッキング停止
  const stopTracking = () => {
    watchRef.current?.remove();
    setTracking(false);
  };

  // 2点間の距離計算（メートル）ハversine公式
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text>現在地を取得中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {/* 現在地マーカー */}
        <Marker coordinate={location} title="現在地" />

        {/* 移動ルート */}
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#4CAF50"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* 情報パネル */}
      <View style={styles.panel}>
        <Text style={styles.distanceText}>
          総移動距離　<Text style={styles.distanceNumber}>{(totalDistance / 1000).toFixed(2)}</Text> km
        </Text>

        <TouchableOpacity
          style={[styles.trackButton, tracking && styles.stopButton]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <Text style={styles.trackButtonText}>
            {tracking ? '⏹ 停止する' : '▶ トラッキング開始'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  panel: { padding: 24, backgroundColor: 'white', gap: 16, alignItems: 'center' },
  distanceText: { fontSize: 16, color: '#333' },
  distanceNumber: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  trackButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, width: 240, alignItems: 'center' },
  stopButton: { backgroundColor: '#FF5722' },
  trackButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});