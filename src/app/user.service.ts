import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrlGenerica = 'https://localhost:9000'
  //private apiUrl = 'https://alarcosj.esi.uclm.es/fakeAccountsBE' 

  constructor(private http:HttpClient) {}

  checkCookie() {
    return this.http.get(this.apiUrlGenerica + "/users/checkCookie", 
		{ responseType : "text", withCredentials : true })
  }


  register(email : String, pw1 : String, pw2 : String){
    let info = {email : email,pwd1 : pw1,pwd2 : pw2}

    let urlFinal = this.apiUrlGenerica + '/users/registrar1'
    return this.http.post<any>(urlFinal,info)
  }

  login(email: String, pwd: String){
    let info = {email : email, pwd : pwd}

    let urlFinal = this.apiUrlGenerica + '/users/login1'

    return this.http.put<any>(urlFinal, info,  
      { responseType: 'text' as 'json', withCredentials : true}).pipe()
  
    //return this.http.put(urlFinal, info, { responseType: 'text' });
  }

}
