import { Routes, CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { GestorListasComponent } from './gestor-listas/gestor-listas.component';
import { SuscripcionComponent } from './suscripcion/suscripcion.component';
import { InvitacionComponent } from './invitacion/invitacion.component';
import { Registrar1Component } from './registrar1/registrar1.component';
import { InicioComponent } from './inicio/inicio.component';
import { Login1Component } from './login1/login1.component';
import { map, switchMap, take } from 'rxjs/operators';
import { UserService } from './user.service';
import { inject } from '@angular/core';

// AuthGuard que permite o deniega el acceso basado en el estado de autenticación y la ruta
const authGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Obtener la ruta actual
  const currentRoute = route.routeConfig?.path || '';

  // Esperar a que el estado de carga inicial termine
  if (userService.isLoading) {
    return userService.loadingCompleted$.pipe(
      take(1),
      switchMap(() => userService.validateToken()),
      map((isAuthenticated) => {
        return handleRouteAccess(currentRoute, isAuthenticated, router);
      })
    );
  }

  // Validar el token para determinar el estado de autenticación
  return userService.validateToken().pipe(
    map((isAuthenticated) => {
      return handleRouteAccess(currentRoute, isAuthenticated, router);
    })
  );
};

// Función que maneja el acceso según la ruta y el estado de autenticación
function handleRouteAccess(route: string, isAuthenticated: boolean, router: Router) {
  // Rutas restringidas para usuarios autenticados
  const restrictedIfAuthenticated = ['IniciarSesion', 'Registrarse'];

  // Rutas restringidas para usuarios no autenticados
  const restrictedIfNotAuthenticated = ['GestionarListas', 'Invitacion'];

  if (isAuthenticated && restrictedIfAuthenticated.includes(route)) {
    console.log(`[AuthGuard] Usuario autenticado intentando acceder a ruta restringida: ${route}.`);
    router.navigate(['/']); // Redirige al inicio si está autenticado
    return false;
  }

  if (!isAuthenticated && restrictedIfNotAuthenticated.includes(route)) {
    console.log(`[AuthGuard] Usuario no autenticado intentando acceder a ruta restringida: ${route}.`);
    router.navigate(['/IniciarSesion']); // Redirige a iniciar sesión si no está autenticado
    return false;
  }

  // Permitir acceso si no está restringido
  return true;
}

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'IniciarSesion', component: Login1Component, canActivate: [authGuard] },
  { path: 'Registrarse', component: Registrar1Component, canActivate: [authGuard] },
  { path: 'Suscripcion', component: SuscripcionComponent },
  { path: 'GestionarListas', component: GestorListasComponent, canActivate: [authGuard] },
  { path: 'Invitacion', component: InvitacionComponent, canActivate: [authGuard] },
  { path: 'SobreNosotros', component: SobreNosotrosComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
