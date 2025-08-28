import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure the API_KEY is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Extracts the barcode or number from a base64 encoded image.
 * @param base64Image The base64 encoded image string.
 * @returns A promise that resolves to the extracted text.
 */
export async function extractTextFromImage(base64Image: string): Promise<string> {
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image,
    },
  };

  const textPart = {
    text: 'この荷札の画像には、通常、上下に2つのバーコードがあります。それぞれのバーコードの上にある数字を両方とも抽出してください。上のバーコードの数字を先に、次に下のバーコードの数字を、カンマで区切って回答してください。例: "12345, 67890"。数字のみを返し、他のテキストは含めないでください。',
  };
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("Could not extract text from the image.");
    }
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to process the image with Gemini API.");
  }
}