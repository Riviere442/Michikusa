import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import Papa from 'papaparse';

// CSVをアプリ内assetから読み込むヘルパー
async function loadCSV(require) {
  const asset = Asset.fromModule(require);
  await asset.downloadAsync();
  const content = await FileSystem.readAsStringAsync(asset.localUri);
  return Papa.parse(content, { header: true, skipEmptyLines: true }).data;
}

// GeoJSONをアプリ内assetから読み込むヘルパー
async function loadGeoJSON(require) {
  const asset = Asset.fromModule(require);
  await asset.downloadAsync();
  const content = await FileSystem.readAsStringAsync(asset.localUri);
  return JSON.parse(content);
}

// 2点間の距離計算（メートル）
export function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 候補からランダムに3件選び直線距離でソート
export function selectAndSortSpots(candidates, currentLat, currentLng, destLat, destLng) {
  // ランダムに3件選ぶ
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // 現在地→経由地→目的地の直線距離合計でソート（昇順）
  return selected
    .map(spot => ({
      ...spot,
      totalDistance: calcDistance(currentLat, currentLng, spot.lat, spot.lng)
                   + calcDistance(spot.lat, spot.lng, destLat, destLng),
    }))
    .sort((a, b) => a.totalDistance - b.totalDistance);
}

// 現在時刻の時間帯を取得（例：14 → '14時'）
function getCurrentHourKey() {
  const hour = new Date().getHours();
  const clamped = Math.min(Math.max(hour, 6), 23);
  return `${clamped}時`;
}

// comfort_avg.csvから観光地の現在時刻の混雑度を取得
async function loadComfortMap() {
  const data = await loadCSV(require('../assets/geodata/comfort_avg.csv'));
  const hourKey = getCurrentHourKey();
  const map = {};
  data.forEach(row => {
    map[row['観光地']] = {
      lat: null, // 後で座標を付与
      lng: null,
      congestion: parseFloat(row[hourKey]) || 1,
    };
  });
  return map;
}

// 11か所の座標（固定値）
const COMFORT_COORDS = {
  '渡月橋北詰':       { lat: 35.0150, lng: 135.6772 },
  '竹林の小径':       { lat: 35.0170, lng: 135.6722 },
  '錦市場':           { lat: 35.0050, lng: 135.7653 },
  '花見小路':         { lat: 35.0035, lng: 135.7752 },
  '清水坂':           { lat: 34.9987, lng: 135.7849 },
  '哲学の道北端':     { lat: 35.0272, lng: 135.7937 },
  '岡崎公園':         { lat: 35.0116, lng: 135.7823 },
  '伏見稲荷大社付近': { lat: 34.9671, lng: 135.7727 },
  '京都駅前バス乗り場':{ lat: 34.9858, lng: 135.7588 },
  '金閣寺道付近':     { lat: 35.0394, lng: 135.7292 },
  '北野天満宮前付近': { lat: 35.0253, lng: 135.7355 },
};

// 候補施設に最寄りのcomfort地点の混雑度を付与
function estimateCongestion(lat, lng, comfortMap) {
  let minDist = Infinity;
  let congestion = 1; // デフォルトは空いている

  Object.entries(COMFORT_COORDS).forEach(([name, coords]) => {
    const dist = calcDistance(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      congestion = comfortMap[name]?.congestion ?? 1;
    }
  });

  // 500m以上離れていれば混雑度1とみなす
  if (minDist > 500) return 1;
  return congestion;
}

// メイン：候補スポットを抽出する
export async function extractCandidateSpots(
  currentLat, currentLng,
  destLat, destLng,
  targetDistanceM  // 目標距離（メートル）
) {
  const comfortMap = await loadComfortMap();
  const candidates = [];

  // 直線距離の合計が目標距離以上になるか確認
  const isValidDetour = (spotLat, spotLng) => {
    const d1 = calcDistance(currentLat, currentLng, spotLat, spotLng);
    const d2 = calcDistance(spotLat, spotLng, destLat, destLng);
    return (d1 + d2) >= targetDistanceM;
  };

  // 混雑度フィルター（3以下のみ）
  const isNotCrowded = (lat, lng) => {
    const congestion = estimateCongestion(lat, lng, comfortMap);
    return congestion <= 3;
  };

  // GeoJSONから候補を追加するヘルパー
  const addFromGeoJSON = (geojson, nameKey) => {
    if (candidates.length >= 16) return;
    for (const feature of geojson.features) {
      if (candidates.length >= 16) break;
      const coords = feature.geometry?.coordinates;
      if (!coords) continue;
      const lng = coords[0];
      const lat = coords[1];
      const name = feature.properties?.[nameKey] || '不明';
      if (isValidDetour(lat, lng) && isNotCrowded(lat, lng)) {
        candidates.push({ name, lat, lng });
      }
    }
  };

  // CSVから候補を追加するヘルパー
  const addFromCSV = (data) => {
    if (candidates.length >= 16) return;
    for (const row of data) {
      if (candidates.length >= 16) break;
      const lat = parseFloat(row['緯度']);
      const lng = parseFloat(row['経度']);
      const name = row['名称'];
      if (!lat || !lng || !name) continue;
      if (isValidDetour(lat, lng) && isNotCrowded(lat, lng)) {
        candidates.push({ name, lat, lng });
      }
    }
  };

  // 各データソースから順番に読み込む
  // GeoJSON読み込み部分を修正
  const cultural = await loadGeoJSON(require('../assets/geodata/cultural/P27-13_26.geojson'));
  addFromGeoJSON(cultural, 'P27_005');

  if (candidates.length < 16) {
    const venues = await loadGeoJSON(require('../assets/geodata/venues/P33-14_26.geojson'));
    addFromGeoJSON(venues, 'P33_005');
  }

  if (candidates.length < 16) {
    const kyotoSpots = await loadCSV(require('../assets/geodata/kyoto_spots.csv'));
    addFromCSV(kyotoSpots);
  }

  return candidates;
}