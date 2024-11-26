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
import { map } from 'rxjs/operators';
import { take } from 'rxjs/operators';



// El guardián se sucribe al estado de autenticación y redirige al usuario según corresponda
const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const path = route.routeConfig?.path;

  return userService.isLoggedIn$.pipe(
    take(1), // Tomar el primer valor y completar el observable
    map(isLoggedIn => {
      if (isLoggedIn) {
        if (['IniciarSesion', 'Registrarse'].includes(path!)) {
          router.navigate(['/GestionarListas']);
          return false;
        }
        return true;
      } else {
        if (['GestionarListas'].includes(path!)) {
          router.navigate(['/IniciarSesion']);
          return false;
        }
        return true;
      }
    })
  );
};

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'IniciarSesion', component: Login1Component, canActivate: [authGuard] },
  { path: 'Registrarse', component: Registrar1Component, canActivate: [authGuard] },
  { path: 'Suscripcion', component: SuscripcionComponent },
  { path: 'GestionarListas', component: GestorListasComponent, canActivate: [authGuard] },
  { path: 'Invitacion', component: InvitacionComponent, canActivate: [authGuard] },
  { path: 'SobreNosotros', component: SobreNosotrosComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];