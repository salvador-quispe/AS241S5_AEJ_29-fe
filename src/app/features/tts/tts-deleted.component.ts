import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsService } from '../../core/services/tts.service';
import { ToastService } from '../../core/services/toast.service';
import { TtsResponse } from '../../core/models/tts.model';

@Component({
  selector: 'app-tts-deleted',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>🗑️ Papelera — TTS</h1>
          <p>Audios eliminados. Puedes restaurarlos en cualquier momento.</p>
        </div>
        <button class="btn btn-ghost" (click)="load()">
          <span [class.spinning]="loading()">↻</span> Actualizar
        </button>
      </div>

      <div class="card">
        <div class="section-header">
          <h2>Audios eliminados
            <span class="badge badge-warning">{{ items().length }}</span>
          </h2>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
            <p>Cargando...</p>
          </div>
        } @else if (items().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🎉</div>
            <p>La papelera está vacía</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Texto</th>
                  <th>Voz</th>
                  <th>Modelo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id) {
                  <tr class="deleted-row">
                    <td><span class="id-badge">#{{ item.id }}</span></td>
                    <td><span class="truncate deleted-text" [title]="item.input">{{ item.input }}</span></td>
                    <td><span class="voice-tag">{{ item.voice }}</span></td>
                    <td><code class="model-tag">{{ item.model }}</code></td>
                    <td><span class="badge badge-muted">Eliminado</span></td>
                    <td class="date-cell">{{ formatDate(item.createdAt) }}</td>
                    <td>
                      <button
                        class="btn btn-success btn-sm"
                        (click)="restore(item)"
                        [disabled]="restoringId() === item.id"
                      >
                        @if (restoringId() === item.id) {
                          <span class="spinner" style="width:14px;height:14px;border-width:2px"></span>
                        } @else {
                          ♻️
                        }
                        Restaurar
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 32px;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      animation: fadeIn 0.4s ease;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      h1 { font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
      p { color: var(--text-secondary); font-size: 14px; }
    }

    .spinning { display: inline-block; animation: spin 1s linear infinite; }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px;
      color: var(--text-muted);
      font-size: 14px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;

      h2 { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    }

    .deleted-row td { opacity: 0.75; }
    .deleted-text { text-decoration: line-through; color: var(--text-muted); }

    .id-badge { font-size: 12px; color: var(--text-muted); font-family: monospace; }
    .voice-tag { font-size: 13px; color: var(--text-secondary); }
    .model-tag { font-size: 11px; background: rgba(99,102,241,0.1); color: var(--primary-light); padding: 2px 8px; border-radius: 4px; }
    .date-cell { font-size: 12px; color: var(--text-muted); white-space: nowrap; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class TtsDeletedComponent implements OnInit {
  private ttsService = inject(TtsService);
  private toastService = inject(ToastService);

  items = signal<TtsResponse[]>([]);
  loading = signal(false);
  restoringId = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.ttsService.getDeleted().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.toastService.error('Error al cargar la papelera'); this.loading.set(false); }
    });
  }

  restore(item: TtsResponse): void {
    this.restoringId.set(item.id);
    this.ttsService.restore(item.id).subscribe({
      next: () => {
        this.items.update(h => h.filter(x => x.id !== item.id));
        this.restoringId.set(null);
        this.toastService.success('Audio restaurado correctamente');
      },
      error: () => { this.toastService.error('Error al restaurar'); this.restoringId.set(null); }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
