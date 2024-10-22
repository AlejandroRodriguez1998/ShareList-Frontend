import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { RouterModule } from '@angular/router';  // Importa RouterModule para routerLink

import { FormsModule } from '@angular/forms'; 
import { UserService } from '../user.service';

//Para los avisos
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar1',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    RouterModule],
  templateUrl: './registrar1.component.html',
  styleUrl: './registrar1.component.css'
})
export class Registrar1Component {
  email? : string
  pwd1? : string
  pwd2? : string
  respuestaOK: boolean
  respuestaPasNoIguales: boolean

  constructor(private service : UserService, private toastr: ToastrService,) { 
    this.respuestaOK = false;
    this.respuestaPasNoIguales = false;
  }

  registrar1() {
    this.respuestaOK = false;
    this.respuestaPasNoIguales = false;

    if (this.pwd1 != this.pwd2) {
      this.respuestaPasNoIguales = true;
      return;
    }

    this.service.register(this.email!, this.pwd1!, this.pwd2!).subscribe(
      ok => {
        console.log('Registro exitoso', ok);
        this.respuestaOK = true;
        this.respuestaPasNoIguales = false;

        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Se te ha enviado un correo electronico.',
          showConfirmButton: true,
        });

      },
      error => {
        console.error('Error en el registro', error);
        this.toastr.error('Hubo un error en el servidor. Inténtalo más tarde.', 'Error del servidor');
      }
    );
  }

}
