import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:9000'
  //private apiUrl = 'https://alarcosj.esi.uclm.es/fakeAccountsBE' 

  constructor(private http:HttpClient) {}

  register(email : String, pw1 : String, pw2 : String){
    let info = {email : email,pwd1 : pw1,pwd2 : pw2}

    let urlFinal = this.apiUrl + '/users/registrar1'
    return this.http.post<any>(urlFinal,info)
  }

  login(email: String, pw: String){
    let info = {email : email, pwd : pw}

    let urlFinal = this.apiUrl + '/users/login1'
    return this.http.put(urlFinal, info, { responseType: 'text' });
  }

}
