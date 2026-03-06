import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { PermissionsService } from './services/permissions.service';

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
    PermissionsService,
    HasPermissionDirective
  ]
};
