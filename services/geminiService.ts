import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;
let lastUsedApiKey: string | null = null;

function getGoogleAI(): GoogleGenAI {
  const API_KEY = localStorage.getItem('gemini_api_key');

  if (!API_KEY) {
    // This error will be caught by the calling function and displayed to the user.
    throw new Error("APIキーが設定されていません。最初の画面でAPIキーを入力してください。");
  }
  
  // Create a new instance if the API key has changed or if it's the first run
  if (API_KEY !== lastUsedApiKey || !ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    lastUsedApiKey = API_KEY;
  }

  return ai;
}

/**
 * Extracts the barcode or number from a base64 encoded image.
 * @param base64Image The base64 encoded image string.
 * @returns A promise that resolves to the extracted text.
 */
export async function extractTextFromImage(base64Image: string): Promise<string> {
  try {
    const genAI = getGoogleAI();

    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: base64Image,
      },
    };

    const textPart = {
      text: 'この荷札の画像には、通常、上下に2つのバーコードがあります。それぞれのバーコードの上にある数字を両方とも抽出してください。上のバーコードの数字を先に、次に下のバーコードの数字を、カンマで区切って回答してください。例: "12345, 67890"。数字のみを返し、他のテキストは含めないでください。',
    };
    
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("画像から有効なテキストを抽出できませんでした。");
    }
    return text;
  } catch (error) {
    console.error("Gemini APIの呼び出し中にエラーが発生しました:", error);
    // Re-throw the error to be handled by the component
    if (error instanceof Error) {
        // Pass the original error message, which might be the API key error.
        throw error;
    }
    throw new Error("Gemini APIで画像の処理中に不明なエラーが発生しました。");
  }
}