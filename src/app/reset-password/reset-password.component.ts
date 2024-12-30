import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
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
    }
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
