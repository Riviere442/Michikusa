const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
import * as ImageManipulator from 'expo-image-manipulator';

// 画像を圧縮するヘルパー
async function compressImage(imageUri) {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 512 } }],  // 幅512pxにリサイズ
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }  // 品質70%
  );
  return result.uri;
}

export async function analyzeCalories(imageUri) {
  try {
    const compressedUri = await compressImage(imageUri);
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    const base64Data = base64.split(',')[1];

    const result = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `この食事の写真を見て、合計カロリーを推定してください。
必ず以下のJSON形式のみで返答してください。他の文章は不要です。
  {
    "totalCalories": 推定カロリーの数値,
    "items": [
      { "name": "料理名", "calories": カロリー数値 }
    ]
  }`
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data,
              }
            }
          ]
        }]
      }),
    });

    // APIのレスポンス自体がエラーの場合
    if (!result.ok) {
      const errorJson = await result.json();
      throw new Error(`API Error ${result.status}: ${errorJson.error?.message}`);
    }

    const json = await result.json();
    const text = json.candidates[0].content.parts[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`JSONが見つかりません。Geminiの返答：${text}`);
    return JSON.parse(jsonMatch[0]);

  } catch (e) {
    // エラーをそのまま上に投げる
    throw e;
  }
}

// blobをbase64に変換するヘルパー
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}