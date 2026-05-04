import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TtsService } from '../../core/services/tts.service';
import { EmailService } from '../../core/services/email.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Backend offline banner -->
      @if (backendOnline() === false) {
        <div class="offline-banner">
          <span class="offline-icon">⚠️</span>
          <div>
            <strong>Backend no disponible</strong>
            <span>No se puede conectar a <code>localhost:8080</code>. Asegúrate de que Spring Boot esté corriendo.</span>
          </div>
          <a href="http://localhost:8080/webjars/swagger-ui/index.html" target="_blank" class="btn btn-ghost btn-sm">Verificar ↗</a>
        </div>
      }

      <!-- Header -->
      <div class="dash-header">
        <div class="dash-header-content">
          <h1>AI Hub Dashboard</h1>
          <p>Gestiona tus servicios de Text-to-Speech y verificación de emails</p>
        </div>
        <div class="header-badge" [ngClass]="backendOnline() === false ? 'badge-offline' : ''">
          <div class="pulse-ring" [style.background]="backendOnline() === false ? '#ef4444' : '#10b981'"></div>
          <span>{{ backendOnline() === false ? 'Offline' : backendOnline() === null ? 'Conectando…' : 'Live' }}</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card" [style.--accent-color]="stat.color">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <div class="stat-glow"></div>
          </div>
        }
      </div>

      <!-- Modules -->
      <div class="modules-grid">
        <!-- TTS Module -->
        <div class="module-card">
          <div class="module-header">
            <div class="module-icon tts-icon">🎙️</div>
            <div>
              <h3>Text to Speech</h3>
              <p>Convierte texto en audio MP3 con voces de IA</p>
            </div>
          </div>
          <div class="module-features">
            <div class="feature">
              <span class="feature-dot"></span>
              <span>6 voces disponibles: alloy, echo, fable, onyx, nova, shimmer</span>
            </div>
            <div class="feature">
              <span class="feature-dot"></span>
              <span>Modelos tts-1 y tts-1-hd</span>
            </div>
            <div class="feature">
              <span class="feature-dot"></span>
              <span>Descarga directa de MP3</span>
            </div>
            <div class="feature">
              <span class="feature-dot"></span>
              <span>CRUD completo con historial</span>
            </div>
          </div>
          <div class="module-actions">
            <a routerLink="/tts" class="btn btn-primary">
              <span>🎙️</span> Ir a TTS
            </a>
            <a routerLink="/tts/deleted" class="btn btn-ghost">
              <span>🗑️</span> Papelera
            </a>
          </div>
        </div>

        <!-- Email Module -->
        <div class="module-card">
          <div class="module-header">
            <div class="module-icon email-icon">✉️</div>
            <div>
              <h3>Email Verification</h3>
              <p>Verifica si un email es válido y existe</p>
            </div>
          </div>
          <div class="module-features">
            <div class="feature">
              <span class="feature-dot email-dot"></span>
              <span>Validación en tiempo real</span>
            </div>
            <div class="feature">
              <span class="feature-dot email-dot"></span>
              <span>Razón detallada del resultado</span>
            </div>
            <div class="feature">
              <span class="feature-dot email-dot"></span>
              <span>Badges visuales: válido / inválido</span>
            </div>
            <div class="feature">
              <span class="feature-dot email-dot"></span>
              <span>CRUD completo con historial</span>
            </div>
          </div>
          <div class="module-actions">
            <a routerLink="/email" class="btn btn-success">
              <span>✉️</span> Ir a Email
            </a>
            <a routerLink="/email/deleted" class="btn btn-ghost">
              <span>🗑️</span> Papelera
            </a>
          </div>
        </div>
      </div>

      <!-- API Info -->
      <div class="api-info card">
        <h3>🔌 Conexión al Backend</h3>
        <div class="api-details">
          <div class="api-item">
            <span class="api-label">Base URL</span>
            <code>http://localhost:8080</code>
          </div>
          <div class="api-item">
            <span class="api-label">Framework</span>
            <code>Spring Boot 3.4.4 + WebFlux</code>
          </div>
          <div class="api-item">
            <span class="api-label">Base de datos</span>
            <code>PostgreSQL (Neon) + R2DBC</code>
          </div>
          <div class="api-item">
            <span class="api-label">Swagger UI</span>
            <a href="http://localhost:8080/webjars/swagger-ui/index.html" target="_blank" class="api-link">
              localhost:8080/swagger-ui ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 32px;
      max-width: 1200px;
      animation: fadeIn 0.4s ease;
    }

    .dash-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .offline-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-md);
      margin-bottom: 8px;
      animation: fadeIn 0.3s ease;
      flex-wrap: wrap;

      strong { display: block; color: #ef4444; font-size: 14px; margin-bottom: 2px; }
      span { color: var(--text-secondary); font-size: 13px; }
      code { font-size: 12px; background: rgba(239,68,68,0.1); padding: 1px 6px; border-radius: 4px; color: #ef4444; }
    }

    .offline-icon { font-size: 22px; flex-shrink: 0; }

    .badge-offline {
      background: rgba(239, 68, 68, 0.1) !important;
      border-color: rgba(239, 68, 68, 0.3) !important;
      color: #ef4444 !important;
    }

    .dash-header-content h1 {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #f1f5f9, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 6px;
    }

    .dash-header-content p {
      color: var(--text-secondary);
      font-size: 15px;
    }

    .header-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 8px 16px;
      border-radius: 20px;
      color: #10b981;
      font-size: 13px;
      font-weight: 600;
      position: relative;
    }

    .pulse-ring {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
      cursor: default;

      &:hover {
        border-color: var(--accent-color, var(--primary));
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      }
    }

    .stat-glow {
      position: absolute;
      top: -20px;
      right: -20px;
      width: 80px;
      height: 80px;
      background: var(--accent-color, var(--primary));
      border-radius: 50%;
      opacity: 0.06;
      filter: blur(20px);
    }

    .stat-icon { font-size: 28px; }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .module-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 24px;
      transition: var(--transition);
      animation: fadeIn 0.5s ease;

      &:hover {
        border-color: var(--border-hover);
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(0,0,0,0.3);
      }
    }

    .module-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;

      h3 {
        font-size: 17px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      p {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }

    .module-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .tts-icon { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); }
    .email-icon { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }

    .module-features {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .feature-dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .email-dot { background: var(--success); }

    .module-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .api-info {
      padding: 24px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
    }

    .api-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .api-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .api-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      font-weight: 600;
    }

    code {
      font-size: 13px;
      color: var(--primary-light);
      background: rgba(99, 102, 241, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
    }

    .api-link {
      font-size: 13px;
      color: var(--accent);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private ttsService = inject(TtsService);
  private emailService = inject(EmailService);

  backendOnline = signal<boolean | null>(null);

  stats = signal([
    { label: 'Audios generados', value: '…', icon: '🎵', color: '#6366f1' },
    { label: 'Emails verificados', value: '…', icon: '📧', color: '#10b981' },
    { label: 'Eliminados TTS', value: '…', icon: '🗑️', color: '#f59e0b' },
    { label: 'Eliminados Email', value: '…', icon: '🗑️', color: '#ef4444' },
  ]);

  ngOnInit(): void {
    this.ttsService.getHistory().subscribe({
      next: (data) => {
        this.backendOnline.set(true);
        this.stats.update(s => { s[0].value = String(data.length); return [...s]; });
      },
      error: () => {
        this.backendOnline.set(false);
        this.stats.update(s => { s[0].value = '—'; return [...s]; });
      }
    });

    this.emailService.getHistory().subscribe({
      next: (data) => this.stats.update(s => { s[1].value = String(data.length); return [...s]; }),
      error: () => this.stats.update(s => { s[1].value = '—'; return [...s]; })
    });

    this.ttsService.getDeleted().subscribe({
      next: (data) => this.stats.update(s => { s[2].value = String(data.length); return [...s]; }),
      error: () => this.stats.update(s => { s[2].value = '—'; return [...s]; })
    });

    this.emailService.getDeleted().subscribe({
      next: (data) => this.stats.update(s => { s[3].value = String(data.length); return [...s]; }),
      error: () => this.stats.update(s => { s[3].value = '—'; return [...s]; })
    });
  }
}
