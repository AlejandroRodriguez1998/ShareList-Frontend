import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { APP_INITIALIZER } from '@angular/core';
import { UserService } from './user.service';
import { firstValueFrom } from 'rxjs';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),  
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    importProvidersFrom(ReactiveFormsModule),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [UserService],
      multi: true
    },
  ]
  
};
export function initializeApp(userService: UserService) {
  return () => new Promise<void>((resolve, reject) => {
    userService.checkSession().subscribe({
      next: () => {
        console.log("[APP_INITIALIZER] Sesión verificada exitosamente.");
        resolve();
      },
      error: (error) => {
        console.error("[APP_INITIALIZER] Error al verificar la sesión:", error);
        resolve(); // Resolvemos incluso en caso de error para que la app continúe
      }
    });
  });
}



