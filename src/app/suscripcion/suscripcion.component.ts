import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

declare var bootstrap: any; 

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})

export class SuscripcionComponent {
  
  key: string = 'pk_test_51Q7a3VAnK2DDJlIhZrUJlNUzrIdXajucOxFNOy5GdgVNGUwQYFy5lsVZsfAzTLI4bEEa7K5Wru2cTgrAtGU9Fetv00E9aN8Rbb';
  stripe: Stripe | null = null;
  clientSecret: string | null = null;
  amount: number = 3.00;
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    loadStripe(this.key).then(stripeInstance => {
      this.stripe = stripeInstance;
    });
  }

  abrirModalStripe() {
    Swal.fire({
      title: 'Preparando el pago...',
      text: 'Por favor, espera mientras preparamos tu pago.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading(Swal.getConfirmButton()); // Mostrar spinner mientras se prepara el pago
      }
    });
  
    // Hacer la solicitud para obtener el clientSecret
    this.http.put('http://localhost:9000/pagos/prepararTransaccion', this.amount, { responseType: 'text' })
      .subscribe({
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
  }

  mostrarStripeEnSweetAlert() {
    var cardElement: any = null;

    Swal.fire({
      title: 'Introduce los datos de tu tarjeta',
      html: `<div id="stripe-container"></div>`,
      showCancelButton: true,
      confirmButtonText: 'Pagar',
      cancelButtonText: 'Cancelar',
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

  montarFormularioStripe() {
    const elements = this.stripe!.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#stripe-container');
    return cardElement;
  }
  
  procesarPago(cardElement: any) {
    return new Promise<void>((resolve, reject) => {
      this.stripe!.confirmCardPayment(this.clientSecret!, {
        payment_method: {
          card: cardElement,
        }
      }).then(({ error, paymentIntent }) => {
        if (error) {
          reject(error);
        } else if (paymentIntent?.status === 'succeeded') {
          resolve();
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
  

}
