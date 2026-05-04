import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tts',
        loadComponent: () => import('./features/tts/tts.component').then(m => m.TtsComponent)
      },
      {
        path: 'tts/deleted',
        loadComponent: () => import('./features/tts/tts-deleted.component').then(m => m.TtsDeletedComponent)
      },
      {
        path: 'email',
        loadComponent: () => import('./features/email/email.component').then(m => m.EmailComponent)
      },
      {
        path: 'email/deleted',
        loadComponent: () => import('./features/email/email-deleted.component').then(m => m.EmailDeletedComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
