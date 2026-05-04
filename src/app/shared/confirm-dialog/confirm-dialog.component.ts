import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="modal-overlay" (click)="onCancel()">
        <div class="modal" style="max-width:400px" (click)="$event.stopPropagation()">
          <div class="confirm-dialog">
            <div class="confirm-icon">{{ icon }}</div>
            <h3>{{ title }}</h3>
            <p>{{ message }}</p>
            <div class="confirm-actions">
              <button class="btn btn-ghost" (click)="onCancel()">Cancelar</button>
              <button class="btn btn-danger" (click)="onConfirm()">{{ confirmLabel }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() confirmLabel = 'Confirmar';
  @Input() icon = '⚠️';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
