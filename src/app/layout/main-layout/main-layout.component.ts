import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-toast />
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--bg-base);
    }
  `]
})
export class MainLayoutComponent {}
