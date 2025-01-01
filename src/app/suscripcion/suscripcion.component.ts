import { loadStripe, Stripe } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { PagosService } from '../pagos.service';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { UserService } from '../user.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})

export class SuscripcionComponent {
  
  key: string = 'pk_test_51Q7a3VAnK2DDJlIhZrUJlNUzrIdXajucOxFNOy5GdgVNGUwQYFy5lsVZsfAzTLI4bEEa7K5Wru2cTgrAtGU9Fetv00E9aN8Rbb';
  clientSecret: string | null = null; // Guarda el clientSecret que se obtiene del servidor
  stripe: Stripe | null = null; // Guarda la instancia de Stripe
  amount: number = 3.00; // Cuanto se tiene que pagar
  
  constructor(private service : PagosService, private userService: UserService) {}

  // Cada vez que se carga el componente, carga la clave de Stripe
  ngOnInit() {
    loadStripe(this.key).then(stripeInstance => {
      this.stripe = stripeInstance;
    });
  }

  // Funcion para abrir el modal de Stripe
  abrirModalStripe() {
    this.userService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        Swal.fire({
          title: 'Preparando el pago...',
          text: 'Por favor, espera mientras preparamos tu pago.',
          allowOutsideClick: false, // Evita el cierre al hacer clic fuera del modal
          allowEscapeKey: false, // Evita el cierre al presionar la tecla Esc
          didOpen: () => {
            Swal.showLoading(Swal.getConfirmButton()); // Mostrar spinner mientras se prepara el pago
          }
        });
      
        // Hacer la solicitud para obtener el clientSecret
        this.service.prepararTransaccion(this.amount).subscribe({
          next: (clientSecret) => {
            if (clientSecret) {
              this.clientSecret = clientSecret;
              this.mostrarStripeEnSweetAlert();  // Mostrar el formulario de Stripe dentro de SweetAlert2
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la transacción. Intenta de nuevo más tarde.'
              });
            }
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error en el servidor',
              text: `Hubo un problema al intentar conectar con el servidor: ${error}`
            });
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Aviso',
          html: '<p>Debes estar <strong>iniciado sesión</strong> para realizar el pago a usuario premium.</p>' +
            '<p><a href="/IniciarSesion">Iniciar Sesión</a> o <a href="/Registrarse"> Registrarse</p>',
        });
      }
    });
  }
  

  // Funcion para mostrar el formulario de Stripe en SweetAlert2
  mostrarStripeEnSweetAlert() {
    var cardElement: any = null; // Necesitamos esto para poder mandarlo luego a procesarPago

    Swal.fire({
      title: 'Introduce los datos de tu tarjeta',
      html: `<div id="stripe-container"></div>`,
      showCancelButton: true,
      confirmButtonText: 'Pagar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f44336',
      allowOutsideClick: false, // Evita el cierre al hacer clic fuera del modal
      allowEscapeKey: false,  // Evita el cierre al presionar la tecla Esc
      didOpen: () => {
        cardElement = this.montarFormularioStripe();
      },
      preConfirm: () => {
        Swal.showLoading(Swal.getConfirmButton());

        return this.procesarPago(cardElement)
        .then(() => {
          Swal.fire('Pago realizado', 'Tu pago ha sido procesado correctamente.', 'success');
        })
        .catch((error) => {
          Swal.showValidationMessage(`Error: ${error.message}`);
          Swal.hideLoading();
          return false;
        });
      }
    });
  }

  // Monta el formulario de Stripe en el div con id stripe-container
  montarFormularioStripe() { 
    const elements = this.stripe!.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#stripe-container');
    return cardElement;
  }
  
  // Procesa el pago con Stripe
  procesarPago(cardElement: any) {
    // Necesita una promise el preConfirm de SweetAlert2
    return new Promise<void>((resolve, reject) => {
      this.stripe!.confirmCardPayment(this.clientSecret!, { // Procesa el pago Stripe
        payment_method: {
          card: cardElement,
        }
      }).then(({ error, paymentIntent }) => {
        if (error) {
          reject(error);
        } else if (paymentIntent?.status === 'succeeded') {
          this.userService.changeToPremium().subscribe(() => {
            resolve();
          }, (error) => {
            reject(error);
          });
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
  
}
