import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import * as Location from 'expo-location';
import { extractCandidateSpots, selectAndSortSpots } from '../utils/spots';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

// 負債カロリーから目標距離を計算（仮：後でhomeから受け取る）
const DEBT_CALORIES = 300;
const USER_WEIGHT = 70;

function calcTargetDistance(debtCalories, weight) {
  // 消費カロリー = 1.05 × 3.5メッツ × 時間 × 体重
  // 時間 = debtCalories / (1.05 × 3.5 × weight)
  // 距離 = 時間(h) × 4km/h × 1000
  const hours = debtCalories / (1.05 * 3.5 * weight);
  return hours * 4000;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false); // スポット抽出中

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchText',
        {
          textQuery: query,
          languageCode: 'ja',
          locationBias: {
            circle: {
              center: { latitude: 35.0116, longitude: 135.7681 },
              radius: 50000.0,
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress',
          }
        }
      );
      setResults(response.data.places || []);
    } catch (e) {
      console.error('Places APIエラー:', e.response?.data || e.message);
      alert('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (place) => {
    setSearching(true);
    try {
      // 現在地を取得
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('位置情報の許可が必要です');
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      const { latitude: currentLat, longitude: currentLng } = current.coords;

      const destLat = place.location.latitude;
      const destLng = place.location.longitude;

      // 目標距離を計算
      const targetDistance = calcTargetDistance(DEBT_CALORIES, USER_WEIGHT);

      // 候補スポットを抽出
      const candidates = await extractCandidateSpots(
        currentLat, currentLng,
        destLat, destLng,
        targetDistance
      );

      // ランダムに3件選んでソート
      const spots = selectAndSortSpots(candidates, currentLat, currentLng, destLat, destLng);

      // map.jsへ遷移（JSON文字列で渡す）
      router.push({
        pathname: '/map',
        params: {
          destName: place.displayName.text,
          destLat,
          destLng,
          currentLat,
          currentLng,
          spots: JSON.stringify(spots),
        }
      });
    } catch (e) {
      console.error('スポット抽出エラー:', e);
      alert('寄り道スポットの取得に失敗しました');
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>目的地を検索</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="例：京都駅、金閣寺"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>検索</Text>
        </TouchableOpacity>
      </View>

      {(loading || searching) && (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>
            {searching ? '寄り道スポットを探しています...' : '検索中...'}
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <Text style={styles.resultName}>{item.displayName.text}</Text>
            <Text style={styles.resultAddress}>{item.formattedAddress}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 48 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: 'white', fontSize: 16 },
  searchButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, justifyContent: 'center' },
  searchButtonText: { color: 'white', fontWeight: 'bold' },
  loadingArea: { alignItems: 'center', marginTop: 24, gap: 8 },
  loadingText: { color: '#888', fontSize: 14 },
  resultItem: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginTop: 8 },
  resultName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  resultAddress: { fontSize: 12, color: '#888', marginTop: 4 },
});