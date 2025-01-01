import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitacionService } from '../invitacion.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  imports: [],
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css'
})
export class InvitacionComponent {

  token: string | null = null;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private service: InvitacionService
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  aceptarInvitacion() {
    if (this.token) {
      this.service.unirseLista(this.token).subscribe({
          next: () => {
            Swal.fire({
              title: 'Invitación Aceptada',
              text: 'Has aceptado la invitación con éxito.',
              allowOutsideClick: false, // Evita el cierre al hacer clic fuera del modal
              allowEscapeKey: false, // Evita el cierre al presionar la tecla Esc
              icon: 'success',
              preConfirm: () => {
                this.router.navigate(['/GestionarListas']); // Redirige a la página principal
              }
            });
          },
          error: (error) => {
            Swal.fire({
              title: 'Algo ha salido mal',
              text: error.error.message,
              confirmButtonText: 'Entendido',
              allowOutsideClick: false, // Evita el cierre al hacer clic fuera del modal
              allowEscapeKey: false, // Evita el cierre al presionar la tecla Esc
              icon: 'warning',
              preConfirm: () => {
                this.router.navigate(['/GestionarListas']); // Redirige a la página principal
              }
            });
          }
        });
    } else {
      Swal.fire({
        title: 'Algo ha salido mal',
        text: 'Invitación no válida.',
        confirmButtonText: 'Entendido',
        allowOutsideClick: false, // Evita el cierre al hacer clic fuera del modal
        allowEscapeKey: false, // Evita el cierre al presionar la tecla Esc
        icon: 'error',
        preConfirm: () => {
          this.router.navigate(['/GestionarListas']); // Redirige a la página principal
        }
      });
    }
  }
}
