import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../core/services/email.service';
import { ToastService } from '../../core/services/toast.service';
import { EmailResponse } from '../../core/models/email.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="email-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>✉️ Email Verification</h1>
          <p>Verifica si un email es válido y existe en tiempo real</p>
        </div>
        <button class="btn btn-ghost" (click)="loadHistory()">
          <span [class.spinning]="loading()">↻</span> Actualizar
        </button>
      </div>

      <!-- Verify Form -->
      <div class="card form-card">
        <div class="form-card-header">
          <h2>🔍 Verificar email</h2>
        </div>

        <form (ngSubmit)="verify()" class="verify-form">
          <div class="email-input-row">
            <div class="form-group" style="flex:1">
              <label>Dirección de email</label>
              <input
                type="email"
                [(ngModel)]="emailInput"
                name="email"
                placeholder="ejemplo@dominio.com"
                required
                autocomplete="off"
              />
            </div>
            <button type="submit" class="btn btn-success btn-lg verify-btn" [disabled]="verifying() || !emailInput.trim()">
              @if (verifying()) {
                <span class="spinner"></span> Verificando...
              } @else {
                🔍 Verificar
              }
            </button>
          </div>
        </form>

        <!-- Last Result -->
        @if (lastResult()) {
          <div class="result-card" [ngClass]="getResultCardClass(lastResult()!.result)">
            <div class="result-icon">{{ getResultIcon(lastResult()!.result) }}</div>
            <div class="result-details">
              <div class="result-email">{{ lastResult()!.email }}</div>
              <div class="result-reason">{{ lastResult()!.reason }}</div>
            </div>
            <span class="badge" [ngClass]="getResultBadge(lastResult()!.result)">
              {{ getResultLabel(lastResult()!.result) }}
            </span>
          </div>
        }
      </div>

      <!-- History Table -->
      <div class="card">
        <div class="section-header">
          <h2>📋 Historial de verificaciones
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
            <div class="empty-icon">📭</div>
            <p>No hay verificaciones aún</p>
            <p style="font-size:12px">Usa el formulario de arriba para verificar tu primer email</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Resultado</th>
                  <th>Razón</th>
                  <th>Válido</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of history(); track item.id) {
                  <tr>
                    <td><span class="id-badge">#{{ item.id }}</span></td>
                    <td>
                      <span class="email-cell">{{ item.email }}</span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getResultBadge(item.result)">
                        {{ getResultLabel(item.result) }}
                      </span>
                    </td>
                    <td>
                      <span class="reason-tag">{{ item.reason }}</span>
                    </td>
                    <td>
                      @if (item.valid) {
                        <span class="valid-icon">✓</span>
                      } @else {
                        <span class="invalid-icon">✕</span>
                      }
                    </td>
                    <td class="date-cell">{{ formatDate(item.createdAt) }}</td>
                    <td>
                      <div class="action-btns">
                        <button class="btn btn-ghost btn-icon" title="Editar" (click)="openEdit(item)">✏️</button>
                        <button class="btn btn-ghost btn-icon" title="Eliminar" (click)="confirmDelete(item)">🗑️</button>
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
            <h3>✏️ Editar verificación #{{ editItem()?.id }}</h3>
            <button class="btn btn-ghost btn-icon" (click)="closeEdit()">✕</button>
          </div>
          <form (ngSubmit)="saveEdit()">
            <div class="form-group" style="margin-bottom:20px">
              <label>Nuevo email</label>
              <input type="email" [(ngModel)]="editEmail" name="editEmail" required />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="closeEdit()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) { <span class="spinner"></span> Verificando... }
                @else { 🔍 Reverificar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Confirm Delete -->
    <app-confirm-dialog
      [visible]="showConfirm()"
      title="Eliminar verificación"
      message="La verificación se moverá a la papelera."
      confirmLabel="Eliminar"
      icon="🗑️"
      (confirmed)="deleteItem()"
      (cancelled)="showConfirm.set(false)"
    />
  `,
  styles: [`
    .email-page {
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

    .form-card { padding: 24px; }

    .form-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      h2 { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    }

    .verify-form { display: flex; flex-direction: column; gap: 16px; }

    .email-input-row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-wrap: wrap;

      > * { min-width: 200px; }
    }

    .verify-btn { flex-shrink: 0; }

    .result-card {
      margin-top: 16px;
      padding: 16px 20px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 16px;
      animation: fadeIn 0.3s ease;
      flex-wrap: wrap;

      &.result-valid {
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.25);
      }
      &.result-invalid {
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
      }
      &.result-error {
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.25);
      }
      &.result-processing {
        background: rgba(99, 102, 241, 0.08);
        border: 1px solid rgba(99, 102, 241, 0.25);
      }
    }

    .result-icon { font-size: 28px; }

    .result-details { flex: 1; }

    .result-email {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .result-reason {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

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

    .id-badge { font-size: 12px; color: var(--text-muted); font-family: monospace; }

    .email-cell {
      font-size: 13px;
      color: var(--text-primary);
      font-family: monospace;
    }

    .reason-tag {
      font-size: 12px;
      color: var(--text-muted);
      background: rgba(100, 116, 139, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .valid-icon { color: #10b981; font-weight: 700; font-size: 16px; }
    .invalid-icon { color: #ef4444; font-weight: 700; font-size: 16px; }

    .date-cell { font-size: 12px; color: var(--text-muted); white-space: nowrap; }

    .action-btns { display: flex; gap: 4px; }

    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class EmailComponent implements OnInit {
  private emailService = inject(EmailService);
  private toastService = inject(ToastService);

  history = signal<EmailResponse[]>([]);
  loading = signal(false);
  verifying = signal(false);
  saving = signal(false);
  editItem = signal<EmailResponse | null>(null);
  lastResult = signal<EmailResponse | null>(null);
  showConfirm = signal(false);
  deleteTarget = signal<EmailResponse | null>(null);

  emailInput = '';
  editEmail = '';

  ngOnInit(): void { this.loadHistory(); }

  loadHistory(): void {
    this.loading.set(true);
    this.emailService.getHistory().subscribe({
      next: (data) => { this.history.set(data); this.loading.set(false); },
      error: () => { this.toastService.error('Error al cargar el historial'); this.loading.set(false); }
    });
  }

  verify(): void {
    if (!this.emailInput.trim()) return;
    this.verifying.set(true);
    this.emailService.verify({ email: this.emailInput }).subscribe({
      next: (res) => {
        this.lastResult.set(res);
        this.history.update(h => [res, ...h]);
        this.emailInput = '';
        this.verifying.set(false);
        this.toastService.success(`Email verificado: ${res.result}`);
      },
      error: () => { this.toastService.error('Error al verificar el email'); this.verifying.set(false); }
    });
  }

  openEdit(item: EmailResponse): void {
    this.editItem.set(item);
    this.editEmail = item.email;
  }

  closeEdit(): void { this.editItem.set(null); }

  saveEdit(): void {
    const item = this.editItem();
    if (!item) return;
    this.saving.set(true);
    this.emailService.update(item.id, { email: this.editEmail }).subscribe({
      next: (res) => {
        this.history.update(h => h.map(x => x.id === res.id ? res : x));
        this.editItem.set(null);
        this.saving.set(false);
        this.toastService.success('Email actualizado y reverificado');
      },
      error: () => { this.toastService.error('Error al actualizar'); this.saving.set(false); }
    });
  }

  confirmDelete(item: EmailResponse): void {
    this.deleteTarget.set(item);
    this.showConfirm.set(true);
  }

  deleteItem(): void {
    const item = this.deleteTarget();
    if (!item) return;
    this.emailService.delete(item.id).subscribe({
      next: () => {
        this.history.update(h => h.filter(x => x.id !== item.id));
        this.showConfirm.set(false);
        this.toastService.success('Verificación eliminada (en papelera)');
      },
      error: () => { this.toastService.error('Error al eliminar'); this.showConfirm.set(false); }
    });
  }

  getResultCardClass(result: string): string {
    return `result-${result}`;
  }

  getResultBadge(result: string): string {
    const map: Record<string, string> = {
      valid: 'badge-success',
      invalid: 'badge-danger',
      error: 'badge-warning',
      processing: 'badge-primary'
    };
    return map[result] || 'badge-muted';
  }

  getResultLabel(result: string): string {
    const map: Record<string, string> = {
      valid: '✓ Válido',
      invalid: '✕ Inválido',
      error: '⚠ Error',
      processing: '⏳ Procesando'
    };
    return map[result] || result;
  }

  getResultIcon(result: string): string {
    const map: Record<string, string> = {
      valid: '✅',
      invalid: '❌',
      error: '⚠️',
      processing: '⏳'
    };
    return map[result] || '📧';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
