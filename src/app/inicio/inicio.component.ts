import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: []
})
export class InicioComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) {}

  ngOnInit() {
    // Comprobar si en la URL se ha pasado un token de activación
    const tokenActivacion = this.route.snapshot.queryParamMap.get('activation');
    if (tokenActivacion) {
      this.userService.activateAccount(tokenActivacion).subscribe({
        next: (respuesta: string) => {
          // El backend devuelve "Cuenta activada correctamente" o "Esta cuenta ya se encontraba activada"
          if (respuesta.includes("ya se encontraba activada")) {
            Swal.fire({
              icon: 'info',
              title: 'Cuenta ya activada',
              text: respuesta,
              confirmButtonText: 'OK'
            });
          } else {
            // Asumimos que es "Cuenta activada correctamente"
            Swal.fire({
              icon: 'success',
              title: '¡Cuenta activada!',
              text: respuesta,
              confirmButtonText: 'OK'
            });
          }
        },
        error: (err) => {
          // Error 400 => token inválido, etc.
          let mensaje = 'Error al activar la cuenta.';
          Swal.fire({
            icon: 'error',
            title: 'Error de activación',
            text: mensaje,
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }
}
