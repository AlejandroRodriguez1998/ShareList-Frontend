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

  constructor(private http:HttpClient) {}

  // Para obtener las listas
  obtenerListas(): Observable<lista[]> {
    let urlFinal = this.apiUrl + '/obtenerListas?email=' + localStorage.getItem('email');
    return this.http.get<lista[]>(urlFinal, {withCredentials: true} );
  }

  // Para crear una lista
  crearLista(nombre: string) {
    const info = {nombre: nombre, 
      email: localStorage.getItem('email')
    };

    const urlFinal = this.apiUrl + '/crearLista';
    return this.http.post<any>(urlFinal, info, { withCredentials: true });
  }

  // Para añadir productos a las listas
  nuevoProducto(idLista: string, producto: producto) {
    let urlFinal= this.apiUrl + '/addProducto';

    const body = {idLista, producto};


    return this.http.post<any>(urlFinal, body, { withCredentials: true });
  }

  actualizarProductoComprado(idProducto: string, udsCompradas: number): Observable<any> {
    let info = { idProducto: idProducto, udsCompradas: udsCompradas };
  
    let urlFinal = this.apiUrl + '/comprar';
    return this.http.put<any>(urlFinal, info, { withCredentials: true });
  }

  actualizarProducto(producto: producto): Observable<any> {

    let urlFinal = this.apiUrl + "/actualizarProducto";
    return this.http.put<any>(urlFinal, producto, { withCredentials: true });
  }

  borrarLista(idLista: string): Observable<any> {

    let urlFinal = this.apiUrl + "/borrarLista";
    return this.http.delete<any>(urlFinal, { body: idLista, withCredentials: true });
  }

  eliminarProducto(idProducto: string): Observable<any> {

    let urlFinal = this.apiUrl + '/borrarProducto';
    return this.http.delete<any>(urlFinal, {body: idProducto, withCredentials: true});
  }
  
}
