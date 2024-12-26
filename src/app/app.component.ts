
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { Component } from '@angular/core';
import { Observable } from "rxjs";

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
  isLoading = true; // Indicador global de carga

  constructor(private userService : UserService, private router: Router) {
    this.isLogin$ = this.userService.isLoggedIn$;
  }

  ngOnInit() {
    this.userService.loadingCompleted$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    
      // Esto es necesario para evitar que el DOM cargue antes de que se actualice la clase
      setTimeout(() => { 
        const appRoot = document.querySelector('app-root');

        if (appRoot) {
          if (!isLoading) {
            appRoot.classList.add('app-loaded');
          } else {
            appRoot.classList.remove('app-loaded');
          }
        }
      }, 0);
    });
  
    if (this.userService.checkToken()) {
      this.userService.validateToken().subscribe({
        next: () => console.log('[AppComponent] Token validado correctamente.'),
        error: (error) => console.error('[AppComponent] Error al validar el token:', error),
      });
    } else {
      console.log('[AppComponent] No se encontró token. Finalizando carga.');
      this.isLoading = false;
      this.userService.updateLoadingStatus(false); // Emitir false si no hay token
    }
  }
  
  // Método para cerrar sesión
  logout() {
    // Llama al servicio para cerrar sesión
    this.userService.logout().subscribe(
      response => { // Si se ha cerrado sesión correctamente
        console.log('Logout exitoso:', response); // Log añadido
        this.router.navigate(['/']); 
      },
      error => { // Si ha habido un error al cerrar sesión
        console.log('Error al cerrar sesión:', error); //
      }
    );
  }

}
