import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState(null);

  // カメラで撮影
  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('カメラの許可が必要です');
      return;
    }
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

  return (
    <View style={styles.container}>

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

      {/* 解析ボタン（写真がある時のみ表示） */}
      {imageUri && (
        <View style={styles.analyzeArea}>
          <TouchableOpacity style={styles.analyzeButton} onPress={() => {}}>
            <Text style={styles.analyzeButtonText}>解析する</Text>
          </TouchableOpacity>
          {/* 撮り直しボタン */}
          <TouchableOpacity onPress={() => setImageUri(null)}>
            <Text style={styles.retakeText}>撮り直す</Text>
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
  selectButtons: { gap: 12 },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', width: 240 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  analyzeArea: { alignItems: 'center', gap: 12 },
  analyzeButton: { backgroundColor: '#FF9800', padding: 16, borderRadius: 12, width: 240, alignItems: 'center' },
  analyzeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  retakeText: { color: '#888', fontSize: 14 },
});