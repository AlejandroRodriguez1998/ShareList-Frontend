import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../auth.service';  
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'; 
import { UserService } from '../user.service';
//Para los avisos
import { ToastrService } from 'ngx-toastr';
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

  loginForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: UserService,
    private authService: AuthService,
    private toastr: ToastrService,  // Inyectar AuthService
    private router: Router) {

    // Inicialización del formulario
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(8), createPasswordStrengthValidator()]]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      console.warn("Formulario inválido");
      this.toastr.warning('Formulario inválido. Revisa los campos.', 'Advertencia');

    } else {
      this.service.login(this.loginForm.controls['email'].value, this.loginForm.controls['pwd'].value)
        .subscribe(
          (data) => {
          this.authService.setCookie('authToken', data, 1);

          Swal.fire({
            icon: 'success',
            title: '¡Bienvenid@!',
            text: 'Has iniciado sesión con éxito.',
            showConfirmButton: true,
          });

          this.router.navigate(['/gestion-listas']); 
        },
        (error) => {
          if (error.status === 401) {
            this.toastr.error('Credenciales incorrectas. Inténtalo de nuevo.', 'Error de autenticación');
          } else {
            this.toastr.error('Hubo un error en el servidor. Inténtalo más tarde.', 'Error del servidor');
          }
        });
    }
  }

  onReset() {
    this.loginForm.reset();
  }

}

export  function createPasswordStrengthValidator(): ValidatorFn {
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