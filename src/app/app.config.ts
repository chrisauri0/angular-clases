import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { AuthService } from './services/auth-service';
import { PermissionsService } from './services/permissions.service';

export function initializeAuth(authService: AuthService) {
  return () => authService.restoreSession();
}

export const appConfig: ApplicationConfig = {
  providers: [

    providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
    PermissionsService,
    HasPermissionDirective
  ]
};
