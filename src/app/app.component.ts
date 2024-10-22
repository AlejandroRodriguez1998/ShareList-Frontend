import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Registrar1Component } from './registrar1/registrar1.component'; 
import { Login1Component } from './login1/login1.component'; 
import { GestorListasComponent } from "./gestor-listas/gestor-listas.component";
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,
    CommonModule,
    RouterOutlet, 
    Registrar1Component,
    Login1Component, 
    GestorListasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ShareList';

  constructor(private authService: AuthService, private router: Router) {}

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Método para hacer logout
  logout() {
    this.authService.clearCookie('authToken');  // Limpiar la cookie
    this.router.navigate(['/login']);  // Redirigir al login
  }
}
