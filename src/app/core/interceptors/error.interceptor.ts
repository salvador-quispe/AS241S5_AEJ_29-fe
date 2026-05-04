import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // During SSR (Node.js), skip all HTTP calls — backend is unreachable from server
  if (!isPlatformBrowser(platformId)) {
    return EMPTY;
  }

  // In browser: pass through normally, let components handle errors
  return next(req);
};
