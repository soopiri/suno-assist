export interface AlbumInput {
  idea: string;
  trackCount: number;
  language: string;
}

export interface AlbumConcept {
  idea: string;
  title: string;
  genre: string;
  vibe: string;
  trackCount: number;
  description: string;
  language: string;
}

export interface Track {
  number: number;
  title: string;
  genre: string;
  vibe: string;
  bpm: string;
  key: string;
  notes: string;
}

export interface SetlistResult {
  albumTitle: string;
  tracks: Track[];
}

export interface LyricsResult {
  trackNumber: number;
  trackTitle: string;
  lyrics: string;
}

export interface SunoPromptResult {
  trackNumber: number;
  trackTitle: string;
  stylePrompt: string;
  lyricsPrompt: string;
}

export interface ImagePromptResult {
  prompt: string;
}

export interface AppConfig {
  openai_api_key: string;
  openai_model: string;
}
