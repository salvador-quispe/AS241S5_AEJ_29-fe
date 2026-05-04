import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConnectionService } from '../../core/services/connection.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <div class="logo" [class.logo-collapsed]="collapsed()">
          <div class="logo-icon">
            <span>AI</span>
          </div>
          @if (!collapsed()) {
            <div class="logo-text">
              <span class="logo-title">AI Hub</span>
              <span class="logo-sub">API Dashboard</span>
            </div>
          }
        </div>
        <button class="collapse-btn" (click)="collapsed.set(!collapsed())" [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (collapsed()) {
              <path d="M9 18l6-6-6-6"/>
            } @else {
              <path d="M15 18l-6-6 6-6"/>
            }
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          @if (!collapsed()) {
            <span class="nav-label">Módulos</span>
          }
          @for (item of navItems; track item.route) {
            <a
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="active"
              [title]="collapsed() ? item.label : ''"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span class="nav-text">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              }
            </a>
          }
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="status-dot" [ngClass]="connectionService.isOnline() === false ? 'offline' : connectionService.isOnline() === null ? 'checking' : ''"></div>
        @if (!collapsed()) {
          <span class="status-text">
            {{ connectionService.isOnline() === false ? 'Backend offline' : connectionService.isOnline() === null ? 'Conectando…' : 'Backend conectado' }}
          </span>
        }
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: sticky;
      top: 0;
      flex-shrink: 0;
      overflow: hidden;
    }

    .sidebar.collapsed { width: 64px; }

    .sidebar-header {
      padding: 20px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      min-height: 72px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      animation: glow-pulse 3s ease-in-out infinite;
    }

    .logo-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .logo-sub {
      font-size: 11px;
      color: var(--text-muted);
      display: block;
      white-space: nowrap;
    }

    .collapse-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      flex-shrink: 0;

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(99, 102, 241, 0.1);
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 10px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-section { display: flex; flex-direction: column; gap: 4px; }

    .nav-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      padding: 0 8px;
      margin-bottom: 6px;
      display: block;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px;
      border-radius: 10px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: var(--transition);
      white-space: nowrap;
      position: relative;

      &:hover {
        background: rgba(99, 102, 241, 0.1);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(99, 102, 241, 0.15);
        color: var(--primary-light);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--primary);
          border-radius: 0 2px 2px 0;
        }
      }
    }

    .nav-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
    .nav-text { font-size: 14px; font-weight: 500; }

    .nav-badge {
      margin-left: auto;
      background: rgba(99, 102, 241, 0.2);
      color: var(--primary-light);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 10px;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
      animation: pulse 2s ease-in-out infinite;

      &.offline {
        background: #ef4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
      }

      &.checking {
        background: #f59e0b;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
      }
    }

    .status-text {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
      50% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.7); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class SidebarComponent implements OnInit {
  collapsed = signal(false);
  connectionService = inject(ConnectionService);

  ngOnInit(): void {
    this.connectionService.check();
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '⚡', route: '/dashboard' },
    { label: 'Text to Speech', icon: '🎙️', route: '/tts' },
    { label: 'Email Verify', icon: '✉️', route: '/email' },
    { label: 'Papelera TTS', icon: '🗑️', route: '/tts/deleted' },
    { label: 'Papelera Email', icon: '🗑️', route: '/email/deleted' },
  ];
}
