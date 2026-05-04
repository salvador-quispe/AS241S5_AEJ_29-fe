import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private platformId = inject(PLATFORM_ID);

  isOnline = signal<boolean | null>(null);

  check(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Use fetch directly — bypasses the Angular HTTP interceptor
    fetch('/api/tts/history', { signal: AbortSignal.timeout(3000) })
      .then(res => {
        this.isOnline.set(res.ok || res.status === 401);
      })
      .catch(() => {
        this.isOnline.set(false);
      });
  }
}
