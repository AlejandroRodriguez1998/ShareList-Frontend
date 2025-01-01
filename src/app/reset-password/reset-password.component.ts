import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { createPasswordStrengthValidator } from '../login1/login1.component'; 


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  
  resetForm: FormGroup;
  token: string | null = null;
  serverErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ){
    // Usamos el mismo validador de fortaleza de contraseña que en login/registro:
    this.resetForm = this.fb.group({
      newPassword: [
        '', 
        [
          Validators.required, 
          Validators.minLength(8),
          createPasswordStrengthValidator() 
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }
  ngOnInit(): void {
    // Capturamos el token del query param
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.toastr.error('Token no válido o ausente.', 'Error');
      this.router.navigate(['/']);
      return;
    }

    // Llamamos al nuevo endpoint /users/check-reset-token para comprobar si sigue válido
    this.userService.checkResetToken(this.token).subscribe({
      error: () => {
        // Si el token está caducado o no es válido mostramos SweetAlert con cuenta atrás
        let tiempo = 10; // 3 segundos
        Swal.fire({
          icon: 'error',
          title: 'Token inválido o usado',
          html: `Este enlace ya ha sido usado o está caducado.<br>Serás redirigido en <b>${tiempo}</b> segundos...`,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false
        });

        // Iniciamos la cuenta atrás
        const interval = setInterval(() => {
          tiempo--;
          if (tiempo <= 0) {
            clearInterval(interval);
            Swal.close();
            this.router.navigate(['/IniciarSesion']);
          } else {
            Swal.update({
              html: `Este enlace ya ha sido usado o está caducado.<br>Serás redirigido en <b>${tiempo}</b> segundos...`
            });
          }
        }, 1000);
      }
    });
  }

  // Validador que comprueba que ambos campos coincidan
  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.toastr.warning('Formulario inválido. Revisa los campos.', 'Advertencia');
      return;
    }

    if (!this.token) {
      this.toastr.error('Token no encontrado. Vuelve a solicitar el enlace.', 'Error');
      return;
    }

    const { newPassword } = this.resetForm.value;

    this.userService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Tu contraseña ha sido restablecida correctamente.',
          showConfirmButton: true
        }).then(() => {
          this.router.navigate(['/IniciarSesion']);
        });
      },
      error: (error) => {
        let mensajeError = 'Error al restablecer la contraseña.';
        
        // Muestra el Toastr con ese mensaje de error
        this.toastr.error(mensajeError, 'Error');
        
        // Muestra el mensaje de error del servidor si existe
        this.serverErrorMessage = error.error?.message || mensajeError;
      }
    });
  }

  cancel() {
    this.router.navigate(['/IniciarSesion']);
  }
}
