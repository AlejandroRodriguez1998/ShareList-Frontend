import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private userService: UserService, private router: Router) {}

  // Si la petición falla por un error de autenticación, redirige al usuario a la página de inicio de sesión
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.userService.updateLoginStatus(false);
          this.router.navigate(['/IniciarSesion']);
        }
        return throwError(() => err);
      })
    );
  }
}
