import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, mapTo, Observable, of, tap, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { error } from 'console';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private isLoggedInSubject = new BehaviorSubject<boolean | null>(null); // Inicializado como null
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Variable publica para saber si está logueado

  private apiUrl = 'https://localhost:9000/users' // URL de la API
  private token: string | null = null; // Token de autenticación

  private sessionCheckedSubject = new BehaviorSubject<boolean>(false);
  sessionChecked$ = this.sessionCheckedSubject.asObservable();

  constructor(private http:HttpClient, private cookieService: CookieService) {}

  // Para actualizar el estado de login
  updateLoginStatus(isLoggedIn: boolean) {
    console.log('Actualizando estado de login a:', isLoggedIn); 
    this.isLoggedInSubject.next(isLoggedIn);
  }

  // Obtenemos la cookie desde el servicio de cookies
  getToken() {
    const token = this.cookieService.get('token');
    console.log('Token obtenido de cookies:', token);
    return token;
  };
  
  checkCookie(): Observable<any> {
    const urlFinal = this.apiUrl + '/checkCookie';
    console.log("[checkCookie] Llamando a checkCookie en:", urlFinal);
    return this.http.get<string>(urlFinal, { responseType: 'text' as 'json', withCredentials: true })      
    .pipe(tap(token => { 
      this.token = token;
      //this.updateLoginStatus(true);
      console.log('[checkCookie] Token obtenido en checkCookie:', token);
    }));
  }
  
// Método para verificar el estado de la sesión al cargar la aplicación
checkSession(): Observable<boolean> {
  console.log(" [checkSession] Iniciando verificación de sesión...");
  return new Observable<boolean>((observer) => {
    this.checkCookie().subscribe({
      next: (response) => {
        console.log("[checkSession] Respuesta del servidor en checkCookie:", response);
        this.updateLoginStatus(true);
        this.sessionCheckedSubject.next(true);
        observer.next(true);
        observer.complete();
      },
      error: (error) => {
        console.error("[checkSession] Error al verificar la cookie:", error);
        this.updateLoginStatus(false);
        this.sessionCheckedSubject.next(true);
        observer.next(false);
        observer.complete();
      }
    });
  });
}



  // Para registrar un usuario
  register(email : String, pw1 : String, pw2 : String){
    let info = {email : email, pwd1 : pw1, pwd2 : pw2}

    let urlFinal = this.apiUrl + '/registrar1'
    // Tenemos que poner withCredentials a false porque si no, da un error de CORS
    return this.http.post<any>(urlFinal,info, { withCredentials: false })
  }

  // Inicio de sesión
  login(email: string, pw: string) {
    let info = { email: email, pwd: pw };

    let urlFinal = this.apiUrl + '/login1';
    return this.http.put<any>(urlFinal, info,  { responseType: 'text' as 'json', withCredentials : true})
    .pipe(tap(() => { this.updateLoginStatus(true); }));
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
