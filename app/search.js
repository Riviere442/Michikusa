import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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
              center: { latitude: 35.0116, longitude: 135.7681 }, // 京都市中心
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
      console.error('Places API エラー:', e.response?.data || e.message);
      alert('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place) => {
    router.push({
      pathname: '/map',
      params: {
        destName: place.displayName.text,
        destLat: place.location.latitude,
        destLng: place.location.longitude,
      }
    });
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

      {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 24 }} />}

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
  resultItem: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginTop: 8 },
  resultName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  resultAddress: { fontSize: 12, color: '#888', marginTop: 4 },
});