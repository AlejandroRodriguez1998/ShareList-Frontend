import { GestorListasComponent } from "./gestor-listas/gestor-listas.component";
import { Registrar1Component } from './registrar1/registrar1.component'; 
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Login1Component } from './login1/login1.component'; 
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { Component } from '@angular/core';
import { Observable } from "rxjs";

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
export class AppComponent{
  title = 'ShareList'; // Título de la página
  isLogin$!: Observable<boolean>; // Observable para saber si el usuario está logueado

  constructor(private userService : UserService, 
    private router: Router, 
    private cookie : CookieService) 
  {
    // Se suscribe al observable para saber si el usuario está logueado
    this.isLogin$ = this.userService.isLoggedIn$;
    // Comprueba la cookie del usuario
    this.userService.checkCookie().subscribe(
      token => {
        console.log('Token recibido:', token);
        this.userService.updateLoginStatus(true);
      }
    );
  }
  
  // Método para cerrar sesión
  logout() {
    // Llama al servicio para cerrar sesión
    this.userService.logout().subscribe(
      response => { // Si se ha cerrado sesión correctamente
        this.userService.updateLoginStatus(false); 
        this.router.navigate(['/']); 
      }
    );
  }

}
