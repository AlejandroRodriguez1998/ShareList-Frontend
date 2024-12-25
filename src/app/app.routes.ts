import { Routes, CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { GestorListasComponent } from './gestor-listas/gestor-listas.component';
import { SuscripcionComponent } from './suscripcion/suscripcion.component';
import { InvitacionComponent } from './invitacion/invitacion.component';
import { Registrar1Component } from './registrar1/registrar1.component';
import { InicioComponent } from './inicio/inicio.component';
import { Login1Component } from './login1/login1.component';
import { UserService } from './user.service';
import { inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';



// El guardián se sucribe al estado de autenticación y redirige al usuario según corresponda
const authGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const path = route.routeConfig?.path;

  console.log(`AuthGuard: Revisando acceso a ruta '${path}'`);
  console.log(userService.isLoggedIn$);

  return combineLatest([userService.sessionChecked$, userService.isLoggedIn$]).pipe(
    filter(([sessionChecked, isLoggedIn]) => sessionChecked === true && isLoggedIn !== null),
    take(1),
    map(([sessionChecked, isLoggedIn]) => {
      console.log(`AuthGuard: Usuario está logueado? ${isLoggedIn}`);
      const rutasPublicas = ['IniciarSesion', 'Registrarse', 'SobreNosotros', '']; // Añade aquí las rutas públicas
      const rutasPrivadas = ['GestionarListas', 'Suscripcion', 'Invitacion']; // Rutas que requieren autenticación

      if (sessionChecked && isLoggedIn) {
        if (['IniciarSesion', 'Registrarse'].includes(path!)) {
          console.log(`AuthGuard: Redirigiendo a '/GestionarListas' desde '${path}'`);
          router.navigate(['/GestionarListas']);
          return false;
        }
        return true; // Usuario autenticado puede acceder a cualquier ruta
      } else {
        if (rutasPrivadas.includes(path!)) {
          console.log(`AuthGuard: Redirigiendo a '/IniciarSesion' desde '${path}'`);
          router.navigate(['/IniciarSesion']);
          return false;
        }
        return true; // Usuario no autenticado puede acceder a rutas públicas
      }
    })
  );
};


export const routes: Routes = [
  { path: '', component: InicioComponent, canActivate: [authGuard] },
  { path: 'IniciarSesion', component: Login1Component, canActivate: [authGuard] },
  { path: 'Registrarse', component: Registrar1Component, canActivate: [authGuard] },
  { path: 'Suscripcion', component: SuscripcionComponent, canActivate: [authGuard] },
  { path: 'GestionarListas', component: GestorListasComponent, canActivate: [authGuard] },
  { path: 'Invitacion', component: InvitacionComponent, canActivate: [authGuard] },
  { path: 'SobreNosotros', component: SobreNosotrosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
