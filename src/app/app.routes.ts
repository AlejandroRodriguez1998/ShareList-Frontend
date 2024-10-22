import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { SuscripcionComponent } from './suscripcion/suscripcion.component';
import { Login1Component } from './login1/login1.component';
import { Registrar1Component } from './registrar1/registrar1.component';
import { GestorListasComponent } from './gestor-listas/gestor-listas.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'iniciar-sesion', component: Login1Component },
  { path: 'registrar', component: Registrar1Component },
  { path: 'suscripcion', component: SuscripcionComponent },
  { path: 'gestion-listas', component: GestorListasComponent },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  // Redirigir a inicio si no hay coincidencias
  { path: '**', redirectTo: '', pathMatch: 'full' }  
];