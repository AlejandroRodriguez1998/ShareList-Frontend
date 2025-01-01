import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registrar1.component.html',
  styleUrl: './registrar1.component.css'
})
export class Registrar1Component {

  serverErrorMessage: string | null = null; // Mensaje de error del servidor
  registerForm: FormGroup; // Formulario de registro
  respuestaOK = false; // Indica si el registro ha sido exitoso

  constructor( private formBuilder: FormBuilder,
    private service: UserService,
    private toastr: ToastrService,
    private router: Router)
  {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd1: ['', [Validators.required, Validators.minLength(8), createPasswordStrengthValidator()]],
      pwd2: ['', [Validators.required]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  // Validador personalizado para comparar contraseñas
  passwordsMatchValidator(form: FormGroup) {
    const pwd1 = form.get('pwd1')?.value;
    const pwd2 = form.get('pwd2')?.value;
    return pwd1 === pwd2 ? null : { passwordsMismatch: true };
  }

  // Método para registrar un usuario
  registrar1() {
    this.respuestaOK = false;
    this.serverErrorMessage = null;
    
    if (this.registerForm.invalid) {
      this.toastr.warning('Formulario inválido. Revisa los campos.', 'Advertencia');
      return;
    }

    const { email, pwd1, pwd2 } = this.registerForm.value;

    this.service.register(email, pwd1, pwd2).subscribe(
      () => {
        this.respuestaOK = true;
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Se te ha enviado un correo electrónico.',
          showConfirmButton: true
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      (error) => {
        if(error.status === 403) {
          this.registerForm.controls['email'].setErrors({ invalid: true });
          this.registerForm.controls['pwd1'].setErrors({ invalid: true });
          this.registerForm.controls['pwd2'].setErrors({ invalid: true });
          this.serverErrorMessage = error.error?.message || 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else {
          console.error('Error en el registro', error);
          this.toastr.error('Hubo un error en el servidor. Inténtalo más tarde.', 'Error del servidor');
        }
      }
    );
  }

  // Método para limpiar el formulario
  onReset() {
    this.registerForm.reset();
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