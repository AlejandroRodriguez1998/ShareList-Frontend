import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvitacionService {

  private apiUrl = 'http://localhost:80/invitaciones'; // URL de la API

  constructor(private http:HttpClient, private userService: UserService) { }

  generarInvitacion(idLista: string): Observable<string> {
    /*const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });*/
  
    let urlFinal = this.apiUrl + '/generarInvitacion';
    return this.http.post<string>(urlFinal, idLista, {responseType: 'text' as 'json', withCredentials: true});
  }

  unirseLista(token: string): Observable<any> {
    let info = { token: token, email: localStorage.getItem('email') };

    /*const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });*/
  
    let urlFinal = this.apiUrl + '/aceptarInvitacion';
    return this.http.post<any>(urlFinal, info, { withCredentials: true });
  }

  eliminarInvitacion(id: string): Observable<any> {
    let urlFinal = this.apiUrl + '/eliminarInvitacion/' + id;
    return this.http.delete<any>(urlFinal, { withCredentials: true });
  }
}
