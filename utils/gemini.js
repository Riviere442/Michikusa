const GEMINI_API_KEY = 'ここにAPIキーを貼る';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function analyzeCalories(imageUri) {
  // 画像をbase64に変換
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  const base64Data = base64.split(',')[1];

  // Gemini APIに送信
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

  const json = await result.json();
  const text = json.candidates[0].content.parts[0].text;

  // JSONを抽出してパース
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('解析結果の形式が不正です');
  return JSON.parse(jsonMatch[0]);
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