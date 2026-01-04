
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProcessingOptions } from "../types";

export const processImage = async (base64Image: string, options: ProcessingOptions): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
      prompt = "Please identify the main subject(s) in this image. Remove the entire background. The output MUST have a completely transparent background (alpha channel). Do not fill with any color. Keep the subject's original lighting and colors.";
      break;
    case 'white':
      prompt = "Identify the main subject(s). Remove the entire background and replace it with a solid, pure #FFFFFF white. Ensure crisp edges.";
      break;
    case 'preset':
    case 'custom_prompt':
      const targetBg = options.mode === 'preset' ? options.presetId : options.customBackgroundPrompt;
      prompt = `Isolate the subject from this image and place it realistically into a new background: ${targetBg}. Match the lighting, shadows, and perspective of the new environment to make the subject feel naturally integrated.`;
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
        prompt = "I have provided two images: the first is the source image with a subject, and the second is the target background. Please cut out the main subject from the first image and place it realistically onto the second image (the background). Adjust shadows and lighting for a perfect blend.";
      } else {
        prompt = "Remove background and make it transparent.";
      }
      break;
    default:
      prompt = "Remove background and make it transparent.";
  }

  parts.push({ text: prompt });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
    config: {
      temperature: 0.4,
    }
  });

  const candidates = response.candidates;
  if (!candidates || candidates.length === 0 || !candidates[0].content?.parts) {
    throw new Error("Failed to process image: No content returned from model.");
  }

  for (const part of candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.data) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }

  throw new Error("No image data found in the response.");
};
