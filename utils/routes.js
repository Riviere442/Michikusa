const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

/**
 * Google Routes API で実際の道路に沿ったルートを取得
 * @param {{ latitude: number, longitude: number }} origin
 * @param {{ latitude: number, longitude: number }} destination
 * @param {{ latitude: number, longitude: number }[]} intermediates - 経由地（省略可）
 * @returns {Promise<{ latitude: number, longitude: number }[]>} ルート座標の配列
 */
export async function fetchRouteCoordinates(origin, destination, intermediates = []) {
  const body = {
    origin: {
      location: {
        latLng: { latitude: origin.latitude, longitude: origin.longitude },
      },
    },
    destination: {
      location: {
        latLng: { latitude: destination.latitude, longitude: destination.longitude },
      },
    },
    travelMode: 'WALK',
    computeAlternativeRoutes: false,
    polylineEncoding: 'GEO_JSON_LINESTRING',
  };

  if (intermediates.length > 0) {
    body.intermediates = intermediates.map((point) => ({
      location: {
        latLng: { latitude: point.latitude, longitude: point.longitude },
      },
    }));
  }

  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'routes.polyline',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errJson = await response.json();
    throw new Error(`Routes API Error ${response.status}: ${errJson.error?.message}`);
  }

  const json = await response.json();
  const geoJsonLine = json.routes?.[0]?.polyline?.geoJsonLinestring;

  if (!geoJsonLine || !geoJsonLine.coordinates) {
    throw new Error('ルートが取得できませんでした');
  }

  // GeoJSON は [lng, lat] なので反転する
  return geoJsonLine.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}