import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr'; // Avisos emergentes
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login1',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule, 
    RouterModule],
  templateUrl: './login1.component.html',
  styleUrl: './login1.component.css'
})
export class Login1Component {

  serverErrorMessage: string | null = null; // Mensaje de error del servidor
  loginForm: FormGroup; // Formulario de inicio de sesión
  submitted = false; // Indica si se ha enviado el formulario
  
  constructor(private formBuilder: FormBuilder, 
    private service: UserService, 
    private toastr: ToastrService, 
    private router: Router) 
  {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(8), createPasswordStrengthValidator()]]
    });
  }

  // Método para enviar el formulario
  onSubmit() {
    this.submitted = true;
    this.serverErrorMessage = null;

    if (this.loginForm.invalid) {
      console.warn("Formulario inválido");
      this.toastr.warning('Formulario inválido. Revisa los campos.', 'Advertencia');

    } else {
      this.service.login(this.loginForm.controls['email'].value, this.loginForm.controls['pwd'].value).subscribe(
        (data) => {
          localStorage.setItem('email', this.loginForm.controls['email'].value);

          Swal.fire({
            icon: 'success',
            title: '¡Bienvenid@!',
            text: 'Has iniciado sesión con éxito.',
            showConfirmButton: true,
          }).then(() => {
            this.router.navigate(['/GestionarListas']); 
          });
        },
        (error) => {
          if (error.status === 403) {
            this.loginForm.controls['email'].setErrors({ invalid: true });
            this.loginForm.controls['pwd'].setErrors({ invalid: true });
            this.serverErrorMessage = error.error?.message || 'Credenciales incorrectas. Inténtalo de nuevo.'; // Mensaje del servidor o predeterminado
          }else if (error.status === 400) {
            this.toastr.error(error.eror?.message || 'Cookie caducada', 'Error de autenticación');
          } else {
            this.toastr.error('Hubo un error en el servidor. Inténtalo más tarde.', 'Error del servidor');
          }
        }
      );
    }
  }

  // Método para reiniciar el formulario
  onReset() {
    this.loginForm.reset();
    this.serverErrorMessage = null;
  }

}

// Validador personalizado para la fortaleza de la contraseña
export function createPasswordStrengthValidator(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;
    
    return !passwordValid ? {passwordStrength:true}: null;
  }
}