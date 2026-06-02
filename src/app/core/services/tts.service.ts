import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TtsRequest, TtsResponse } from '../models/tts.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TtsService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/tts`;

  generate(data: TtsRequest): Observable<TtsResponse> {
    return this.http.post<TtsResponse>(`${this.BASE}/generate`, data);
  }

  getHistory(): Observable<TtsResponse[]> {
    return this.http.get<TtsResponse[]>(`${this.BASE}/history`);
  }

  getDeleted(): Observable<TtsResponse[]> {
    return this.http.get<TtsResponse[]>(`${this.BASE}/deleted`);
  }

  update(id: number, data: TtsRequest): Observable<TtsResponse> {
    return this.http.put<TtsResponse>(`${this.BASE}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  restore(id: number): Observable<TtsResponse> {
    return this.http.patch<TtsResponse>(`${this.BASE}/${id}/restore`, {});
  }

  getAudioUrl(id: number | string): string {
    return `${environment.apiUrl}/api/tts/${id}/audio`;
  }

  downloadAudio(id: number | string, filename?: string): void {
    const url = this.getAudioUrl(id);
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename || `audio-${id}.mp3`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }
}
