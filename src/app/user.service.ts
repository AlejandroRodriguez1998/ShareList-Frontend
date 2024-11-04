import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  private apiUrl = 'https://localhost:9000/users'
  private token: string | null = null;

  constructor(private http:HttpClient) {}

  updateLoginStatus(isLoggedIn: boolean) {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  checkCookie(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/checkCookie`, { responseType: 'text' as 'json', withCredentials: true })
      .pipe(tap(token => { this.isLoggedInSubject.next(!!token); }));
  }
  
  register(email : String, pw1 : String, pw2 : String){
    let info = {email : email,pwd1 : pw1,pwd2 : pw2}

    let urlFinal = this.apiUrl + '/registrar1'
    return this.http.post<any>(urlFinal,info)
  }

  login(email: String, pw: String){
    let info = {email : email, pwd : pw}

    let urlFinal = this.apiUrl + '/login1'
    return this.http.put<any>(urlFinal, info,  { responseType: 'text' as 'json', withCredentials : true})
      .pipe(tap(() => { this.updateLoginStatus(true); }));   
  }

}
