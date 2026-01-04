
export type BackgroundMode = 'transparent' | 'white' | 'preset' | 'custom_upload' | 'custom_prompt';

export interface PresetBackground {
  id: string;
  name: string;
  url: string;
  prompt: string;
}

export interface ProcessingOptions {
  mode: BackgroundMode;
  presetId?: string;
  customBackgroundPrompt?: string;
  customBackgroundImage?: string; // base64
}

export interface ImageState {
  original: string | null;
  processed: string | null;
  isLoading: boolean;
  error: string | null;
}
