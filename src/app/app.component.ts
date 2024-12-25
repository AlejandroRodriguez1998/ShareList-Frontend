import { GestorListasComponent } from "./gestor-listas/gestor-listas.component";
import { Registrar1Component } from './registrar1/registrar1.component'; 
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Login1Component } from './login1/login1.component'; 
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { Component } from '@angular/core';
import { Observable } from "rxjs";
import { error } from "console";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,
    CommonModule,
    RouterOutlet, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'ShareList'; // Título de la página
  isLogin$: Observable<boolean | null>;
  sessionChecked? : boolean; // Variable para saber si la sesión ha sido verificada

  constructor(private userService : UserService, private router: Router) {
    // Inicializa la variable isLogin$ con el valor de isLoggedIn$ del servicio
    this.isLogin$ = this.userService.isLoggedIn$;

    // Nos suscribimos a sessionChecked$
    this.userService.sessionChecked$.subscribe(checked => {
      console.log('[AppComponent] sessionChecked ha cambiado a:', checked);
      this.sessionChecked = checked;
    });

  }

  ngOnInit() {
    console.log('[AppComponent] ngOnInit llamado.');
    // No es necesario llamar a checkSession aquí porque ya se llama en APP_INITIALIZER
  }
  
  
  // Método para cerrar sesión
  logout() {
    // Llama al servicio para cerrar sesión
    this.userService.logout().subscribe(
      response => { // Si se ha cerrado sesión correctamente
        //this.userService.updateLoginStatus(false); 
        console.log('Logout exitoso:', response); // Log añadido
        this.router.navigate(['/']); 
      },
      error => { // Si ha habido un error al cerrar sesión
        console.log('Error al cerrar sesión:', error); //
      }
    );
  }

}
