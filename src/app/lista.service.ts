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

  // Para crear las listas
  crearLista(nombre : string){
    let info = JSON.stringify({nombre: nombre, token: this.userService.getToken()});

    let urlFinal = this.apiUrl + '/crearLista';
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
  
}
