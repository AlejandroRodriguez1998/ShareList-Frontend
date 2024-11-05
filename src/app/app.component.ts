import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Registrar1Component } from './registrar1/registrar1.component'; 
import { Login1Component } from './login1/login1.component'; 
import { GestorListasComponent } from "./gestor-listas/gestor-listas.component";
import { AuthService } from './auth.service';
import { UserService } from './user.service';

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
  isLoggedIn: boolean = false;


  constructor(private userService : UserService, private router:Router) {
    this.userService.checkCookie().subscribe(
      token=> {
        console.log('Token recibido:', token);
        //this.router.navigate(['/GestorListas']);
        this.isLoggedIn = true;
      }
    )
  }


  // Método para hacer logout
  logout() {
    this.isLoggedIn = false;
    this.router.navigate(['/login']);  // Redirigir al login
  }
}
