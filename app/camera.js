import { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { analyzeCalories } from '../utils/gemini';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [calories, setCalories] = useState(null);   // 解析結果
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(1)).current;  // フェードアウト用

  // カメラで撮影
  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('カメラの許可が必要です');
      return;
    }
    
    alert(
      '以下の点に注意して撮影してください。\n\n' +
      '明るい場所で撮影する\n' +
      '真上から撮影する\n' +
      '食材を重ねない'
    );
    
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // ライブラリから選択
  const handleLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('写真へのアクセス許可が必要です');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeCalories(imageUri);

      // ボタンをフェードアウト
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCalories(result.totalCalories);
        setItems(result.items);
        setLoading(false);
      });
    } catch (e) {
      console.error('解析エラー詳細:', e);
      alert(`解析に失敗しました\n\n原因：${e.message}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* 戻るボタン（左上固定） */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (imageUri) {
            setImageUri(null);
            setCalories(null);
            setItems([]);
            buttonOpacity.setValue(1);
          } else {
            router.replace('/home');
          }
        }}
      >
        <Text style={styles.backButtonText}>← 戻る</Text>
      </TouchableOpacity>

      {/* 写真表示エリア */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>写真を選んでください</Text>
        </View>
      )}

      {/* 写真選択ボタン（写真がない時のみ表示） */}
      {!imageUri && (
        <View style={styles.selectButtons}>
          <TouchableOpacity style={styles.button} onPress={handleCamera}>
            <Text style={styles.buttonText}>📷 撮影する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLibrary}>
            <Text style={styles.buttonText}>🖼 ライブラリから選ぶ</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* 解析ボタン（フェードアウトする） */}
      {imageUri && !calories && (
        <Animated.View style={{ opacity: buttonOpacity }}>
          <TouchableOpacity
            style={[styles.analyzeButton, loading && styles.disabled]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            <Text style={styles.analyzeButtonText}>
              {loading ? '解析中...' : '解析する'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setImageUri(null)} style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={[styles.retakeText, { marginTop: 7 }]}>撮り直す</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 解析結果 */}
      {calories && (
        <View style={styles.resultArea}>
          <Text style={styles.totalCalories}>
            合計<Text style={styles.calorieNumber}>{calories}</Text>kcal
          </Text>
          {items.map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.name}：{item.calories}kcal
            </Text>
          ))}
          <TouchableOpacity style={styles.detourButton} onPress={() => router.push('/search')}>
            <Text style={styles.detourButtonText}>寄り道する →</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', gap: 24 },
  image: { width: 320, height: 320, borderRadius: 16 },
  placeholder: { width: 320, height: 320, borderRadius: 16, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#888', fontSize: 16 },
  selectButtons: { gap: 12, alignItems: 'center' },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', width: 240 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 70, left: 20, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#4CAF50', borderRadius: 8, zIndex: 10 },
  backButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  analyzeButton: { backgroundColor: '#FF9800', padding: 16, borderRadius: 12, width: 240, alignItems: 'center' },
  analyzeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabled: { backgroundColor: '#ccc' },
  retakeText: { color: '#888', fontSize: 16 },
  resultArea: { alignItems: 'center', gap: 8 },
  totalCalories: { fontSize: 20, color: '#333' },
  calorieNumber: { fontSize: 48, fontWeight: 'bold', color: '#FF5722' },
  itemText: { fontSize: 14, color: '#666' },
  detourButton: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detourButtonText: { fontSize: 18, color: '#4CAF50', fontWeight: 'bold' },
});