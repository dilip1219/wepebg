import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProcessingOptions } from "../types";

export const processImage = async (base64Image: string, options: ProcessingOptions): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/png';
  const data = base64Image.split(',')[1];

  let prompt = "";
  const parts: any[] = [
    {
      inlineData: {
        data: data,
        mimeType: mimeType,
      },
    }
  ];

  switch (options.mode) {
    case 'transparent':
      prompt = "You are a professional image editing AI. Task: Remove the background from this image. RETURN ONLY THE MAIN SUBJECT. The background MUST be perfectly transparent (alpha channel). Do not add any background colors like white or black. Preserve all fine details of the subject edges (e.g., hair, fur). Output should be a PNG with transparency.";
      break;
    case 'white':
      prompt = "Isolate the main subject from this image and replace the entire background with a solid, pure white (#FFFFFF) background. Ensure the edges are clean and crisp.";
      break;
    case 'preset':
    case 'custom_prompt':
      const targetBg = options.mode === 'preset' ? options.presetId : options.customBackgroundPrompt;
      prompt = `Isolate the subject from this image and place it realistically into this new background environment: ${targetBg}. Adjust lighting, shadows, and color balance of the subject to match the new background perfectly.`;
      break;
    case 'custom_upload':
      if (options.customBackgroundImage) {
        const bgMime = options.customBackgroundImage.match(/data:(.*?);/)?.[1] || 'image/png';
        const bgData = options.customBackgroundImage.split(',')[1];
        parts.push({
          inlineData: {
            data: bgData,
            mimeType: bgMime,
          },
        });
        prompt = "Task: Background replacement. I've provided two images. The first is the source image. The second is the desired background. Please cut out the subject from the first image and place it onto the second image. Harmonize lighting and shadows so it looks like a single, professional photograph.";
      } else {
        prompt = "Remove background and make it transparent.";
      }
      break;
    default:
      prompt = "Remove the background and make it transparent.";
  }

  parts.push({ text: prompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        temperature: 0.1, // Lower temperature for more consistent, precise editing
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content?.parts) {
      throw new Error("The AI didn't return a valid response. Try again with a clearer image.");
    }

    for (const part of candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data: string = part.inlineData.data; // Fixed type safety
        return `data:image/png;base64,${base64Data}`;
      }
    }

    throw new Error("The AI processed the image but didn't return a new one. This can happen with very complex backgrounds.");
  } catch (error: any) {
    if (error.message?.includes('403') || error.message?.includes('API_KEY_INVALID')) {
      throw new Error("Invalid API Key. Please check your VITE_API_KEY setting.");
    }
    throw error;
  }
};