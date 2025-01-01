import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private apiUrl = 'https://localhost:9000/pagos' // URL de la API

  constructor(private http:HttpClient) { }

  // Para obtener el token
  prepararTransaccion(amount: number){  
    let urlFinal = this.apiUrl + '/prepararTransaccion';
    return this.http.put(urlFinal, amount, { responseType: 'text' });
  }
}
