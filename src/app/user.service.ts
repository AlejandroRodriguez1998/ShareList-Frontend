import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(true); // Estado inicial: cargando

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  loadingCompleted$ = this.loadingSubject.asObservable();

  isLoading = true;

  private apiUrl = 'https://localhost:9000/users';

  constructor(private http:HttpClient, private cookieService: CookieService) {}

  updateLoadingStatus(status: boolean) {
    this.loadingSubject.next(status);
  }

  // Verificar si existe un token
  checkToken(): boolean {
    const token = this.cookieService.get('token');
    return !!token;
  }

  // Al completar la validación del token, asegúrate de emitir false
  validateToken(): Observable<boolean> {
    if (!this.checkToken()) {
      this.loadingSubject.next(false);
      this.isLoggedInSubject.next(false);
      return of(false);
    }

    const urlFinal = this.apiUrl + '/checkCookie';

    return this.http.get<boolean>(urlFinal, {responseType: 'text' as 'json', withCredentials: true })
    .pipe(
      tap(() => { // Cuando el token es válido
        this.loadingSubject.next(false); // Finaliza la carga
        this.isLoggedInSubject.next(true);
        return of(true);
      }),
      catchError((error) => { // Cuando el token no es válido
        this.loadingSubject.next(false); // Finaliza la carga incluso con error
        this.isLoggedInSubject.next(false);
        return of(false);
      })
    );
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
    .pipe(tap(() => { this.isLoggedInSubject.next(true); }));
  }

  // Método de logout para eliminar el token
  logout(): Observable<any> {
    return this.http.get(`${this.apiUrl}/logout`, { withCredentials: true }).pipe(
      tap(() => {
        this.cookieService.delete('token');
        this.isLoggedInSubject.next(false);
      })
    );
  }

  // Cambiar a usuario premium
  changeToPremium() {
    let urlFinal = this.apiUrl + '/premium';
    return this.http.get<any>(urlFinal, { withCredentials: true });
  }

}
