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
import { UserService } from './user.service';

// Guard único que controla el acceso en función de la autenticación y la ruta
const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService); // Inyecta el servicio UserService
  var isLogin = userService.isLoggedIn$; // Observable que indica si el usuario está logueado
  const router = inject(Router); // Inyecta el servicio Router

  const path = route.routeConfig?.path; // Ruta actual
  var salida = true; // Variable de salida

  isLogin.subscribe(isLoggedIn => {
    if (isLoggedIn) {
      if (['IniciarSesion', 'Registrarse'].includes(path!)) {
        router.navigate(['/GestionarListas']);
        salida = false 
      }
    } else {
      if (['GestionarListas'].includes(path!)) {
        router.navigate(['/IniciarSesion']);
        salida = false
      }
    }
  });

  return salida; 
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