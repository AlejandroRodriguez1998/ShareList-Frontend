import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Para saber si está logueado
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Variable publica para saber si está logueado

  private apiUrl = 'https://localhost:9000/users' // URL de la API
  private token: string | null = null; // Token de autenticación

  constructor(private http:HttpClient) {}

  // Para actualizar el estado de login
  updateLoginStatus(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  // Para obtener el token
  getToken() {
    return this.token
  };
  
  // Para comprobar si hay cookie
  checkCookie(): Observable<string> {
    let urlFinal = this.apiUrl + '/checkCookie';
    return this.http.get<string>(urlFinal, { responseType: 'text' as 'json', withCredentials: true })      
    .pipe(tap(token => { 
      this.token = token;
    }));
  }

  // Para registrar un usuario
  register(email : String, pw1 : String, pw2 : String){
    let info = {email : email, pwd1 : pw1, pwd2 : pw2}

    let urlFinal = this.apiUrl + '/registrar1'
    return this.http.post<any>(urlFinal,info)
  }

  // Para loguear un usuario
  login(email: String, pw: String){
    let info = {email : email, pwd : pw}

    let urlFinal = this.apiUrl + '/login1'
    return this.http.put<any>(urlFinal, info,  { responseType: 'text' as 'json', withCredentials : true})
    .pipe(tap(() => { this.updateLoginStatus(true); }));
  }

  // Para desloguear un usuario
  logout(){
    let urlFinal = this.apiUrl + '/logout'
    return this.http.get<any>(urlFinal, { withCredentials: true })
    .pipe(tap(() => { this.updateLoginStatus(false); }));
  }

  //Para cambiarle a premium
  changeToPremium(){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    let urlFinal = this.apiUrl + '/premium'
    return this.http.get<any>(urlFinal, { headers, withCredentials: true })
  }

}
