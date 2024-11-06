import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs/internal/Observable';
import { producto } from './modelo/producto.model';
import { lista } from './modelo/lista.model';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ListaService {

  private apiUrl = 'http://localhost:80/lista'; // URL de la API

  constructor(private http:HttpClient, private userService : UserService) {}

  // Para obtener las listas
  obtenerListas(): Observable<lista[]> {
    let urlFinal = this.apiUrl + '/obtenerListas?email=' + localStorage.getItem('email');
    return this.http.get<lista[]>(urlFinal);
  }

  // Para crear una lista
  crearLista(nombre: string) {
    console.log(localStorage.getItem('email'));
    const info = {nombre: nombre, 
      token: this.userService.getToken(), 
      email: localStorage.getItem('email')
    };
  
    const urlFinal = this.apiUrl + '/crearLista';
    return this.http.post<any>(urlFinal, info);
  }

  // Para añadir productos a las listas
  aniadirProducto(idLista: string, producto: producto) {
    let urlFinal= this.apiUrl + '/addProducto';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'idLista': idLista  
    });

    return this.http.post<any>(urlFinal, producto, { headers });
  }

  borrarLista(idLista: string): Observable<any> {
    let info = {idLista: idLista, token: this.userService.getToken()};

    let urlFinal = this.apiUrl + "/borrarLista";
    return this.http.delete<any>(urlFinal, { body: info });
  }
  
}
