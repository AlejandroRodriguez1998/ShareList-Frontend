// src/app/app.routes.ts
import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { InicioComponent } from './inicio/inicio.component';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { SuscripcionComponent } from './suscripcion/suscripcion.component';
import { Login1Component } from './login1/login1.component';
import { Registrar1Component } from './registrar1/registrar1.component';
import { GestorListasComponent } from './gestor-listas/gestor-listas.component';

// Guard único que controla el acceso en función de la autenticación y la ruta
const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      console.log('Ruta:', route.routeConfig?.path, 'Autenticado:', isLoggedIn);
      const path = route.routeConfig?.path;

      // Rutas de acceso público solo para usuarios no autenticados
      if (['IniciarSesion', 'Registrarse'].includes(path!) && isLoggedIn) {
        router.navigate(['/GestionarListas']); // Redirige si ya está autenticado
        return false;
      }

      // Rutas protegidas que requieren autenticación
      if (['GestionarListas'].includes(path!) && !isLoggedIn) {
        router.navigate(['/IniciarSesion']); // Redirige si no está autenticado
        return false;
      }

      // Permitir el acceso en todos los demás casos
      return true;
    })
  );
};

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'IniciarSesion', component: Login1Component, canActivate: [authGuard] },
  { path: 'Registrarse', component: Registrar1Component, canActivate: [authGuard] },
  { path: 'Suscripcion', component: SuscripcionComponent },
  { path: 'GestionarListas', component: GestorListasComponent, canActivate: [authGuard] },
  { path: 'SobreNosotros', component: SobreNosotrosComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];