import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TtsService } from '../../core/services/tts.service';
import { ToastService } from '../../core/services/toast.service';
import { TtsRequest, TtsResponse } from '../../core/models/tts.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tts',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="tts-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>🎙️ Text to Speech</h1>
          <p>Genera audios MP3 con voces de inteligencia artificial</p>
        </div>
        <button class="btn btn-ghost" (click)="loadHistory()">
          <span [class.spinning]="loading()">↻</span> Actualizar
        </button>
      </div>

      <!-- Generate Form -->
      <div class="card form-card">
        <div class="form-card-header">
          <h2>✨ Generar nuevo audio</h2>
          @if (lastGenerated()) {
            <span class="badge badge-success">Último: {{ lastGenerated()?.voice }}</span>
          }
        </div>

        <form (ngSubmit)="generate()" class="tts-form">
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label>Modelo</label>
              <select [(ngModel)]="form.model" name="model">
                <option value="tts-1">tts-1 (Rápido)</option>
                <option value="tts-1-hd">tts-1-hd (Alta calidad)</option>
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label>Voz</label>
              <select [(ngModel)]="form.voice" name="voice">
                @for (v of voices; track v.value) {
                  <option [value]="v.value">{{ v.label }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Texto a convertir</label>
            <textarea
              [(ngModel)]="form.input"
              name="input"
              placeholder="Escribe el texto que quieres convertir a audio..."
              rows="4"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>Instrucciones de estilo <span class="optional">(opcional)</span></label>
            <input
              type="text"
              [(ngModel)]="form.instructions"
              name="instructions"
              placeholder="Ej: Speak in a lively and optimistic tone."
            />
          </div>

          <!-- Voice Preview -->
          <div class="voice-preview">
            @for (v of voices; track v.value) {
              <button
                type="button"
                class="voice-chip"
                [class.active]="form.voice === v.value"
                (click)="form.voice = v.value"
              >
                {{ v.emoji }} {{ v.value }}
              </button>
            }
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="generating() || !form.input.trim()">
              @if (generating()) {
                <span class="spinner"></span> Generando...
              } @else {
                <span>🎵</span> Generar Audio
              }
            </button>
          </div>
        </form>

        <!-- Result Preview -->
        @if (lastGenerated()) {
          <div class="result-preview">
            <div class="result-info">
              <div class="audio-wave">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div>
                <p class="result-text">{{ lastGenerated()?.input }}</p>
                <p class="result-meta">{{ lastGenerated()?.voice }} · {{ lastGenerated()?.model }}</p>
              </div>
            </div>
            <button
              class="btn btn-success"
              (click)="download(lastGenerated()!)"
              [disabled]="lastGenerated()?.result !== 'completed'"
            >
              ⬇️ Descargar MP3
            </button>
          </div>
        }
      </div>

      <!-- History Table -->
      <div class="card">
        <div class="section-header">
          <h2>📋 Historial de audios
            <span class="badge badge-primary">{{ history().length }}</span>
          </h2>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
            <p>Cargando historial...</p>
          </div>
        } @else if (history().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🎵</div>
            <p>No hay audios generados aún</p>
            <p style="font-size:12px">Usa el formulario de arriba para crear tu primer audio</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Texto</th>
                  <th class="hide-sm">Voz</th>
                  <th class="hide-md">Modelo</th>
                  <th class="hide-sm">Estado</th>
                  <th class="hide-md">Fecha</th>
                  <th class="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of history(); track item.id) {
                  <tr class="table-row">
                    <td><span class="id-badge">#{{ item.id }}</span></td>
                    <td class="col-text">
                      <span class="truncate" [title]="item.input">{{ item.input }}</span>
                      <!-- Mobile-only inline info -->
                      <div class="mobile-meta">
                        <span class="voice-tag">{{ getVoiceEmoji(item.voice) }} {{ item.voice }}</span>
                        <span class="badge" [ngClass]="getResultBadge(item.result)">{{ getResultLabel(item.result) }}</span>
                      </div>
                    </td>
                    <td class="hide-sm">
                      <span class="voice-tag">{{ getVoiceEmoji(item.voice) }} {{ item.voice }}</span>
                    </td>
                    <td class="hide-md"><code class="model-tag">{{ item.model }}</code></td>
                    <td class="hide-sm">
                      <span class="badge" [ngClass]="getResultBadge(item.result)">
                        {{ getResultLabel(item.result) }}
                      </span>
                    </td>
                    <td class="date-cell hide-md">{{ formatDate(item.createdAt) }}</td>
                    <td class="col-actions">
                      <div class="action-btns">
                        <button
                          class="btn btn-ghost btn-icon"
                          title="Descargar MP3"
                          (click)="download(item)"
                          [disabled]="item.result !== 'completed'"
                        >⬇️</button>
                        <button
                          class="btn btn-ghost btn-icon"
                          title="Editar"
                          (click)="openEdit(item)"
                        >✏️</button>
                        <button
                          class="btn btn-ghost btn-icon"
                          title="Eliminar"
                          (click)="confirmDelete(item)"
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Edit Modal -->
    @if (editItem()) {
      <div class="modal-overlay" (click)="closeEdit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>✏️ Editar audio #{{ editItem()?.id }}</h3>
            <button class="btn btn-ghost btn-icon" (click)="closeEdit()">✕</button>
          </div>

          <form (ngSubmit)="saveEdit()" class="tts-form">
            <div class="form-row">
              <div class="form-group" style="flex:1">
                <label>Modelo</label>
                <select [(ngModel)]="editForm.model" name="editModel">
                  <option value="tts-1">tts-1</option>
                  <option value="tts-1-hd">tts-1-hd</option>
                </select>
              </div>
              <div class="form-group" style="flex:1">
                <label>Voz</label>
                <select [(ngModel)]="editForm.voice" name="editVoice">
                  @for (v of voices; track v.value) {
                    <option [value]="v.value">{{ v.label }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Texto</label>
              <textarea [(ngModel)]="editForm.input" name="editInput" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label>Instrucciones</label>
              <input type="text" [(ngModel)]="editForm.instructions" name="editInstructions" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="closeEdit()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) { <span class="spinner"></span> Guardando... }
                @else { 💾 Guardar y regenerar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Confirm Delete -->
    <app-confirm-dialog
      [visible]="showConfirm()"
      title="Eliminar audio"
      message="El audio se moverá a la papelera. Puedes restaurarlo después."
      confirmLabel="Eliminar"
      icon="🗑️"
      (confirmed)="deleteItem()"
      (cancelled)="showConfirm.set(false)"
    />
  `,
  styles: [`
    .tts-page {
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

      h1 {
        font-size: 26px;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      p { color: var(--text-secondary); font-size: 14px; }
    }

    .spinning { display: inline-block; animation: spin 1s linear infinite; }

    .form-card { padding: 24px; }

    .form-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      h2 { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    }

    .tts-form { display: flex; flex-direction: column; gap: 16px; }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      > * { min-width: 160px; }
    }

    .optional { color: var(--text-muted); font-size: 11px; font-weight: 400; }

    .voice-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .voice-chip {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      font-size: 12px;
      cursor: pointer;
      transition: var(--transition);

      &:hover, &.active {
        border-color: var(--primary);
        background: rgba(99, 102, 241, 0.15);
        color: var(--primary-light);
      }
    }

    .form-actions { display: flex; justify-content: flex-end; }

    .result-preview {
      margin-top: 16px;
      padding: 16px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      animation: fadeIn 0.3s ease;
    }

    .result-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .result-text {
      font-size: 14px;
      color: var(--text-primary);
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px;
      color: var(--text-muted);
      font-size: 14px;
    }

    .id-badge {
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
    }

    .voice-tag {
      font-size: 13px;
      color: var(--primary-light);
    }

    .model-tag {
      font-size: 11px;
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary-light);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .date-cell {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    /* Sticky actions column — always visible */
    .col-actions {
      position: sticky;
      right: 0;
      background: var(--bg-card);
      z-index: 2;
      white-space: nowrap;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
    }

    thead .col-actions {
      background: rgba(99, 102, 241, 0.08);
    }

    tr:hover .col-actions {
      background: rgba(99, 102, 241, 0.05);
    }

    .col-text {
      max-width: 0;
      width: 100%;
    }

    .action-btns {
      display: flex;
      gap: 4px;
      justify-content: flex-end;
    }

    /* Mobile meta — shown only when columns are hidden */
    .mobile-meta {
      display: none;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      flex-wrap: wrap;
    }

    @media (max-width: 900px) {
      .hide-md { display: none; }
    }

    @media (max-width: 640px) {
      .hide-sm { display: none; }
      .mobile-meta { display: flex; }
      .tts-page { padding: 16px; gap: 16px; }
      .page-header h1 { font-size: 20px; }
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;

      h2 {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .table-wrapper {
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      overflow-x: auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class TtsComponent implements OnInit {
  private ttsService = inject(TtsService);
  private toastService = inject(ToastService);

  history = signal<TtsResponse[]>([]);
  loading = signal(false);
  generating = signal(false);
  saving = signal(false);
  editItem = signal<TtsResponse | null>(null);
  lastGenerated = signal<TtsResponse | null>(null);
  showConfirm = signal(false);
  deleteTarget = signal<TtsResponse | null>(null);

  form: TtsRequest = {
    input: '',
    model: 'tts-1',
    voice: 'alloy',
    instructions: ''
  };

  editForm: TtsRequest = {
    input: '',
    model: 'tts-1',
    voice: 'alloy',
    instructions: ''
  };

  voices = [
    { value: 'alloy' as const, label: '🎤 Alloy', emoji: '🎤' },
    { value: 'echo' as const, label: '🔊 Echo', emoji: '🔊' },
    { value: 'fable' as const, label: '📖 Fable', emoji: '📖' },
    { value: 'onyx' as const, label: '💎 Onyx', emoji: '💎' },
    { value: 'nova' as const, label: '⭐ Nova', emoji: '⭐' },
    { value: 'shimmer' as const, label: '✨ Shimmer', emoji: '✨' },
  ];

  ngOnInit(): void { this.loadHistory(); }

  loadHistory(): void {
    this.loading.set(true);
    this.ttsService.getHistory().subscribe({
      next: (data) => { this.history.set(data); this.loading.set(false); },
      error: () => { this.toastService.error('Error al cargar el historial'); this.loading.set(false); }
    });
  }

  generate(): void {
    if (!this.form.input.trim()) return;
    this.generating.set(true);
    const payload = { ...this.form };
    if (!payload.instructions) delete (payload as any).instructions;

    this.ttsService.generate(payload).subscribe({
      next: (res) => {
        this.lastGenerated.set(res);
        this.history.update(h => [res, ...h]);
        this.form.input = '';
        this.form.instructions = '';
        this.generating.set(false);
        this.toastService.success('Audio generado correctamente');
      },
      error: () => { this.toastService.error('Error al generar el audio'); this.generating.set(false); }
    });
  }

  openEdit(item: TtsResponse): void {
    this.editItem.set(item);
    this.editForm = { input: item.input, model: item.model as any, voice: item.voice as any, instructions: '' };
  }

  closeEdit(): void { this.editItem.set(null); }

  saveEdit(): void {
    const item = this.editItem();
    if (!item) return;
    this.saving.set(true);
    const payload = { ...this.editForm };
    if (!payload.instructions) delete (payload as any).instructions;

    this.ttsService.update(item.id, payload).subscribe({
      next: (res) => {
        this.history.update(h => h.map(x => x.id === res.id ? res : x));
        this.editItem.set(null);
        this.saving.set(false);
        this.toastService.success('Audio actualizado y regenerado');
      },
      error: () => { this.toastService.error('Error al actualizar'); this.saving.set(false); }
    });
  }

  confirmDelete(item: TtsResponse): void {
    this.deleteTarget.set(item);
    this.showConfirm.set(true);
  }

  deleteItem(): void {
    const item = this.deleteTarget();
    if (!item) return;
    this.ttsService.delete(item.id).subscribe({
      next: () => {
        this.history.update(h => h.filter(x => x.id !== item.id));
        this.showConfirm.set(false);
        this.toastService.success('Audio eliminado (en papelera)');
      },
      error: () => { this.toastService.error('Error al eliminar'); this.showConfirm.set(false); }
    });
  }

  download(item: TtsResponse): void {
    this.ttsService.downloadAudio(item.id, `audio-${item.id}-${item.voice}.mp3`);
    this.toastService.info('Descargando MP3...');
  }

  getVoiceEmoji(voice: string): string {
    const map: Record<string, string> = { alloy: '🎤', echo: '🔊', fable: '📖', onyx: '💎', nova: '⭐', shimmer: '✨' };
    return map[voice] || '🎵';
  }

  getResultBadge(result: string): string {
    const map: Record<string, string> = {
      completed: 'badge-info',
      processing: 'badge-warning',
      error: 'badge-danger'
    };
    return map[result] || 'badge-muted';
  }

  getResultLabel(result: string): string {
    const map: Record<string, string> = {
      completed: '✓ Completado',
      processing: '⏳ Procesando',
      error: '✕ Error'
    };
    return map[result] || result;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
