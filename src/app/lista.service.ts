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
    const info = {nombre: nombre, 
      email: localStorage.getItem('email')
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });
  
    const urlFinal = this.apiUrl + '/crearLista';
    return this.http.post<any>(urlFinal, info, { headers });
  }

  // Para añadir productos a las listas
  nuevoProducto(idLista: string, producto: producto) {
    let urlFinal= this.apiUrl + '/addProducto';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'idLista': idLista,
      'Authorization': 'Bearer ' + this.userService.getToken()
    });

    return this.http.post<any>(urlFinal, producto, { headers });
  }

  actualizarProductoComprado(idProducto: string, udsCompradas: number): Observable<any> {
    let info = { idProducto: idProducto, udsCompradas: udsCompradas };
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });
  
    let urlFinal = this.apiUrl + '/comprar';
    return this.http.put<any>(urlFinal, info, { headers });
  }

  actualizarLista(lista: lista): Observable<lista> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });
    
    let urlFinal = this.apiUrl + "/actualizarLista";
    return this.http.put<lista>(urlFinal, lista, { headers });
  }

  borrarLista(idLista: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });

    let urlFinal = this.apiUrl + "/borrarLista";
    return this.http.delete<any>(urlFinal, { body: idLista, headers });
  }

  eliminarProducto(idProducto: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.userService.getToken()
    });
  
    let urlFinal = this.apiUrl + '/borrarProducto';
    return this.http.delete<any>(urlFinal, {body: idProducto, headers });
  }
  
}
