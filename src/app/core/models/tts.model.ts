export interface TtsRequest {
  input: string;
  model: 'tts-1' | 'tts-1-hd';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  instructions?: string;
}

export interface TtsResponse {
  id: number;
  requestUuid: string;
  input: string;
  model: string;
  voice: string;
  active: boolean;
  result: 'processing' | 'completed' | 'error';
  downloadUrl: string;
  createdAt: string;
}
