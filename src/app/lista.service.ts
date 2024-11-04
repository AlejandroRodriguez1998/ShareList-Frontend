import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { producto } from './modelo/producto.model';
import { Observable} from 'rxjs/internal/Observable';
import { lista } from './modelo/lista.model';

@Injectable({
  providedIn: 'root'
})

export class ListaService {

  private apiUrl = 'http://localhost:80/lista';

  constructor(private http:HttpClient) {}

  obtenerListas(): Observable<lista[]> {
    let urlFinal = this.apiUrl + '/obtenerListas'
    return this.http.get<lista[]>(urlFinal);
  }

  crearLista(nombre : string){
    let urlFinal = this.apiUrl + '/crearLista';
    return this.http.post<any>(urlFinal, nombre);
  }

  aniadirProducto(idLista: string, producto: producto) {
    let urlFinal= this.apiUrl + '/addProducto';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'idLista': idLista  
    });

    return this.http.post<any>(urlFinal, producto, { headers });
  }
  
}
