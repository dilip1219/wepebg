
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProcessingOptions } from "../types";

export const processImage = async (base64Image: string, options: ProcessingOptions): Promise<string> => {
  // Directly use process.env.API_KEY as per the @google/genai coding guidelines.
  // The client initialization must use the named parameter object.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
      prompt = "You are an expert image segmentation AI. TASK: Precisely extract the main subject from this image. The background MUST be perfectly transparent (alpha channel). Do not fill the background with white, black, or any color. Return only the subject with its original lighting and clean edges. Output format: PNG with transparency.";
      break;
    case 'white':
      prompt = "Isolate the main subject and replace the background with a pure solid white (#FFFFFF). Ensure the edges between the subject and the new white background are clean and professional.";
      break;
    case 'preset':
    case 'custom_prompt':
      const targetBg = options.mode === 'preset' ? options.presetId : options.customBackgroundPrompt;
      prompt = `Carefully cut out the subject from this image and place it onto a new background described as: "${targetBg}". Harmonize the shadows and lighting so the subject blends naturally into the new environment.`;
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
        prompt = "I have provided two images. The first image contains the subject. The second image is the desired background. Please cut the subject from the first image and realistically place it onto the second image. Match the depth of field and lighting.";
      } else {
        prompt = "Remove background and make it transparent.";
      }
      break;
    default:
      prompt = "Remove background and make it transparent.";
  }

  parts.push({ text: prompt });

  try {
    // Generate content using gemini-2.5-flash-image for image editing tasks.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        temperature: 0.1,
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content?.parts) {
      throw new Error("No response from AI. The image might be too complex or violated safety guidelines.");
    }

    // Iterate through all parts to find the image part as recommended by the guidelines.
    for (const part of candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("AI processed the request but did not return an image part.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('403')) {
      throw new Error("API Key Error: Please check if your Gemini API key is active and has billing enabled if required.");
    }
    throw new Error(error.message || "An unexpected error occurred during image processing.");
  }
};
