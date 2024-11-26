import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Para saber si está logueado
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Variable publica para saber si está logueado

  private apiUrl = 'https://localhost:9000/users' // URL de la API
  private token: string | null = null; // Token de autenticación

  constructor(private http:HttpClient, private cookieService: CookieService) {}

  // Para actualizar el estado de login
  updateLoginStatus(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  // Obtenemos la cookie desde el servicio de cookies
  getToken() {
    return this.cookieService.get('token');
  };
  
  // Comprueba si hay una cookie de sesión válida
  checkCookie(): Observable<any> {
    let urlFinal = this.apiUrl + '/checkCookie';
    return this.http.get<any>(urlFinal, { withCredentials: true })
      .pipe(tap(response => {
        if (response.isValid) {
          this.updateLoginStatus(true);
        }
      }));
  }

    // Método para verificar el estado de la sesión al cargar la aplicación
    checkSession(): void {
      this.checkCookie().subscribe(
        (response) => {
          if (response.isValid) {
            this.updateLoginStatus(true);
          } else {
            this.updateLoginStatus(false);
          }
        },
        (error) => {
          this.updateLoginStatus(false);
        }
      );
    }

  // Para registrar un usuario
  register(email : String, pw1 : String, pw2 : String){
    let info = {email : email, pwd1 : pw1, pwd2 : pw2}

    let urlFinal = this.apiUrl + '/registrar1'
    return this.http.post<any>(urlFinal,info)
  }

  // Inicio de sesión
  login(email: string, pw: string) {
    let info = { email: email, pwd: pw };

    let urlFinal = this.apiUrl + '/login1';
    return this.http.put<any>(urlFinal, info, { withCredentials: true })
      .pipe(tap(response => {
        this.updateLoginStatus(true);
      }));
  }

  // Para desloguear un usuario
  logout() {
    let urlFinal = this.apiUrl + '/logout';
    return this.http.get<any>(urlFinal, { withCredentials: true })
      .pipe(tap(() => {
        this.cookieService.delete('token');
        this.updateLoginStatus(false);
      }));
  }

  
  // Cambiar a usuario premium
  changeToPremium() {
    let urlFinal = this.apiUrl + '/premium';
    return this.http.get<any>(urlFinal, { withCredentials: true });
  }

}
