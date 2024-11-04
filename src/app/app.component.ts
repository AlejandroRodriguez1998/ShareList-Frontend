import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Registrar1Component } from './registrar1/registrar1.component'; 
import { Login1Component } from './login1/login1.component'; 
import { GestorListasComponent } from "./gestor-listas/gestor-listas.component";
import { UserService } from './user.service';
import { Observable } from 'rxjs';
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
  title = 'ShareList';
  isLogin$!: Observable<boolean>;

  constructor(private userService : UserService, private router: Router) {
    this.isLogin$ = this.userService.isLoggedIn$;
    this.userService.checkCookie().subscribe(
      token => {
        console.log('Token recibido:', token);
        this.userService.updateLoginStatus(true); // Para marcar como autenticado
      }
    );
  }

  logout() {
    this.userService.updateLoginStatus(false); // Para marcar como no autenticado
    this.router.navigate(['/']);  // Redirigir al login
  }

}
