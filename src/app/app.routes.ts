// src/app/app.routes.ts
import { Routes, CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { GestorListasComponent } from './gestor-listas/gestor-listas.component';
import { SuscripcionComponent } from './suscripcion/suscripcion.component';
import { Registrar1Component } from './registrar1/registrar1.component';
import { InicioComponent } from './inicio/inicio.component';
import { Login1Component } from './login1/login1.component';
import { CookieService } from 'ngx-cookie-service';
import { inject } from '@angular/core';

// Guard único que controla el acceso en función de la autenticación y la ruta
const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router); // Inyecta el servicio Router
  const cookie = inject(CookieService); // Inyecta el servicio CookieService

  const path = route.routeConfig?.path;
  var token = cookie.get('fakeUserId'); // Para ver si está autenticado

  // Rutas protegidas que no requieren autenticación
  if (['IniciarSesion', 'Registrarse'].includes(path!) && token) {
    router.navigate(['/GestionarListas']);
    return false;
  }

  // Rutas protegidas que requieren autenticación
  if (['GestionarListas'].includes(path!) && !token) {
    router.navigate(['/IniciarSesion']);
    return false;
  }

  return true; // Rutas públicas
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