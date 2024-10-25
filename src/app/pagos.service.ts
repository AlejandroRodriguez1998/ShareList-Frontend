import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private apiUrl = 'http://localhost:9000/pagos'

  constructor(private http:HttpClient) { }

  prepararTransaccion(amount: number){
    return this.http.put(this.apiUrl + '/prepararTransaccion', amount, { responseType: 'text' });
  }
}
