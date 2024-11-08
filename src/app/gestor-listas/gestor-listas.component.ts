import { producto } from '../modelo/producto.model';
import { ListaService } from '../lista.service';
import { CommonModule } from '@angular/common';
import { lista } from '../modelo/lista.model';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; // Avisos emergentes
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { InvitacionService } from '../invitacion.service';

declare var bootstrap: any; // Para usar los modales de Bootstrap

@Component({
  selector: 'app-gestor-listas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestor-listas.component.html',
  styleUrl: './gestor-listas.component.css'
})
export class GestorListasComponent {

  valoresOriginales: { [idProducto: string]: Partial<producto> } = {};

  listaSeleccionada?: lista; // Lista seleccionada para añadir productos
  indiceListaSeleccionada!: number; // Índice de la lista seleccionada
  misListas: lista[] = []; // Listas del usuario
  nombreLista?: string; // Nombre de la lista a crear

  // Productos
  producto? : producto;
  nuevoProducto : string = '';
  unidadesPedidas : number = 0;
  unidadesCompradas: number = 0;
  
  enlaceInvitacion: string = ''; // Enlace de invitación para compartir

  // Websocket para listas compartidas
  ws : WebSocket = new WebSocket('ws://localhost/wsLista?email=' + localStorage.getItem('email'));

  private timeout: any;

  constructor(private service: ListaService, 
    private toastr: ToastrService, 
    private invitacionService: InvitacionService) 
  {

    // Eventos del websocket - Error 
    this.ws.onerror = function(event){
      console.error('Error en la conexión websocket:', event);
    }

    // Eventos del websocket - Mensaje recibido
    this.ws.onmessage = function(event){
      console.log('Mensaje recibido:', event.data);

      let data = JSON.parse(event.data);

      if (data.tipo == "actualizacion"){
        console.log(data.nombre);
      }
    }
  }

  // Método que se ejecuta al cargar el componente
  ngOnInit() {
    this.cargarListas();
  }

  // Método para cargar las listas del usuario
  cargarListas() {
    this.service.obtenerListas().subscribe(
      (listas) => {
        this.misListas = listas;
        console.log('Listas cargadas:', this.misListas);
      },
      (error) => {
        console.error('Error al cargar las listas', error);
      }
    );
  }

  // Método para añadir una lista
  agregarLista() {
    if (!this.nombreLista) {
      this.toastr.info('El nombre no puede estar vacío', 'Advertencia');
      return;
    }else if(this.nombreLista === ""){
      this.toastr.info('El nombre no puede estar vacio', 'Advertencia');
      return;
    }else if (this.nombreLista.length > 80) {
      this.toastr.info('El nombre de la lista esta limitado a 80 caracteres', 'Advertencia');
      return;
    }

    this.service.crearLista(this.nombreLista!).subscribe(
      (response) => {
        let listaCreada = new lista();
        listaCreada.id = response.id;
        listaCreada.nombre = response.nombre;

        this.misListas.push(listaCreada);

        this.toastr.success(`La lista "${listaCreada.nombre}" ha sido creada correctamente.`,);
        console.log('Nueva Lista añadida', listaCreada);
      },
      (error) => {
        if (error.status === 403) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite alcanzado',
            html: '<p>Los usuarios <strong>no premium</strong> solo pueden tener hasta 2 listas creadas simultáneas.</p>' +
            '<p>Considera <a href="/Suscripcion">actualizar</a> para añadir más listas.</p>',            
            showConfirmButton: true,
            confirmButtonText: 'Entendido'
          });
        }else {
          console.error('Error en añadir la lista: ', error.error.message);
          this.toastr.error(error.error.message, 'Error de creación');
        }
      }
    );
  }

  // Método para eliminar una lista
  eliminarLista(index: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.borrarLista(this.misListas[index].id).subscribe(
          () => {
            this.misListas.splice(index, 1);

            Swal.fire(
              'Eliminada',
              'La lista ha sido eliminada.',
              'success'
            );
          },
          error => {
            if (error.status === 401 || error.status === 400) {
              Swal.fire(
                'Advertencia',
                error.error.message,
                'warning'
              );
            }else {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar la lista.',
                'error'
              );
            }
          }          
        );
      }
    });
  }

  // Método para añadir un producto a la lista
  agregarProducto() {
    if (this.nuevoProducto && this.listaSeleccionada) {
      const modalElement = document.getElementById('productoModal');
      const modal = bootstrap.Modal.getInstance(modalElement);

      console.log(`Voy a almacenar producto: "${this.nuevoProducto}"`);

      const nuevoProducto = new producto(); // Crear una nueva instancia de producto cada vez
      nuevoProducto.crearProducto(this.nuevoProducto, this.unidadesPedidas, this.unidadesCompradas);

      // Verifica si unidadesPedidas es 0 y muestra un SweetAlert de confirmación
      if (this.unidadesPedidas === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          html: "<p>Has establecido la cantidad en 0.</p>" +
          "<p>Esto impedirá que luego puedas comprar.</p>" +
          "<p>¿Deseas continuar?</p>",
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardarProducto(nuevoProducto, modal);
          }
        });
      } else {
        this.guardarProducto(nuevoProducto, modal);
      }
    } else {
      if (this.nuevoProducto === "") {
        this.toastr.info('El nombre del producto no puede estar vacío.', 'Advertencia');
      } else {
        console.error('Faltan datos para crear el producto o no hay lista seleccionada');
        this.toastr.error(`Hubo algún problema. Inténtalo de nuevo.`, 'Error de agregación');

        this.limpiarCamposModal();
      }
    }
  }

  // Método auxiliar para guardar el producto
  private guardarProducto(nuevoProducto: producto, modal: any) {
    this.service.nuevoProducto(this.listaSeleccionada!.id, nuevoProducto).subscribe(
      (response: lista) => {
        console.log('Lista actualizada con el nuevo producto:', response);

        // Actualiza la lista seleccionada en misListas con la respuesta del backend
        const index = this.misListas.findIndex(lista => lista.id === this.listaSeleccionada!.id);
        if (index !== -1) {
          this.misListas[index] = response; // Actualiza la lista completa
        }

        // Ocultar el modal
        modal.hide();
        this.limpiarCamposModal();

        this.toastr.success(`El producto "${nuevoProducto.nombre}" ha sido agregado a la lista`);
      },
      (error) => {
        if (error.status === 403) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite alcanzado',
            html: '<p>Los usuarios <strong>no premium</strong> solo pueden tener hasta 10 productos en una lista.</p>' +
            '<p>Considera <a href="/Suscripcion">actualizar</a> para añadir más productos.</p>',
            showConfirmButton: true,
            confirmButtonText: 'Entendido'
          });
          modal.hide();

        } else{
          console.log('Error al agregar el producto:', error);
          this.toastr.error(error.error.message, 'Error de agregación');
        }

        this.limpiarCamposModal();
      }
    );
  }

  // Método para actualizar la cantidad comprada de un producto
  actualizarCantidadComprada(producto: producto, listaIndex: number, productoIndex: number) {
    if (producto.udsCompradas === null || producto.udsCompradas === undefined || isNaN(producto.udsCompradas)) {
      this.toastr.info('La cantidad comprada no puede estar vacía.','Advetencia');
      producto.udsCompradas = this.valoresOriginales[producto.id].udsCompradas!;
      return;
    } else {
      this.valoresOriginales[producto.id].udsCompradas = producto.udsCompradas;
    }

    // Limpiar cualquier temporizador anterior
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Esperar un tiempo antes de hacer la llamada al servidor
    this.timeout = setTimeout(() => {
      // Validar la cantidad antes de enviar la petición
      if (producto.udsCompradas > producto.udsPedidas) {
        this.toastr.info('La cantidad comprada no puede superar las unidades pedidas.','Advetencia');
        producto.udsCompradas = producto.udsPedidas; // Ajuste opcional
        return;
      }

      // Llamada al servicio para actualizar la cantidad comprada en el backend
      this.service.actualizarProductoComprado(producto.id, producto.udsCompradas).subscribe(
        response => {
          this.toastr.success(`El producto "${producto.nombre}" ha sido comprado correctamente`);
          
          // Actualizar directamente el producto en misListas usando los índices proporcionados
          this.misListas[listaIndex].productos[productoIndex] = { ...response };
        },
        error => {
          console.error('Error al actualizar la cantidad comprada:', error);
          this.toastr.error(error.error.message, 'Error de compra');
        }
      );
    }, 500); // 500 ms de retraso
  }

  // Método para actualizar un producto
  actualizarProducto(producto: producto, indexLista: number) {
    if (producto.udsPedidas === null || producto.udsPedidas === undefined || isNaN(producto.udsPedidas)) {
      this.toastr.info('La cantidad pedida no puede estar vacía.','Advetencia');
      producto.udsPedidas = this.valoresOriginales[producto.id].udsPedidas!;
      return;
    } else {
      this.valoresOriginales[producto.id].udsPedidas = producto.udsPedidas;
    }

    if (producto.nombre === "" || producto.nombre === null || producto.nombre === undefined) {
      this.toastr.info('El nombre del producto no puede estar vacío.','Advetencia');
      producto.nombre = this.valoresOriginales[producto.id].nombre!;
      return;
    } else {
      this.valoresOriginales[producto.id].nombre = producto.nombre;
    }

    if (this.listaSeleccionada) {
      // Llama al servicio para actualizar la lista
      this.service.actualizarLista(this.listaSeleccionada).subscribe(
        response => {
          this.toastr.success('Producto actualizado correctamente');
          this.misListas[indexLista] = response;
        },
        error => {
          console.error('Error al actualizar el producto:', error);
          this.toastr.error(error.error.message, 'Error de actualización');
        }
      );
    }
  }

  // Método para eliminar un producto
  eliminarProducto(idProducto: string, indexLista: number, indexProducto: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarProducto(idProducto).subscribe(
          () => {
            this.misListas[indexLista].productos.splice(indexProducto, 1);

            Swal.fire(
              'Eliminada',
              'El producto ha sido eliminado.',
              'success'
            );
          },
          error => {
            if (error.status === 401 || error.status === 400) {
              Swal.fire(
                'Advertencia',
                error.error.message,
                'warning'
              );
            } else {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar el producto.',
                'error'
              );
            }
          }          
        );
      }
    });
  }

  generarEnlaceInvitacion(indexLista: number) {
    const lista = this.misListas[indexLista];

    console.log(lista.id)

    this.invitacionService.generarInvitacion(lista.id).subscribe(
      (token) => {
        // Guarda el enlace generado en una variable para mostrarlo en el modal
        this.enlaceInvitacion = window.location.origin + "/Invitacion?token=" + token;

        // Mostrar el enlace en un SweetAlert
        Swal.fire({
          title: 'Enlace de invitación',
          html: `
            <p>Comparte este enlace para invitar a alguien a tu lista:</p>
            <input id="enlaceInvitacion" type="text" class="form-control" value="${this.enlaceInvitacion}" readonly>
            <button id="copiarEnlaceBtn" class="btn btn-primary mt-3">Copiar enlace</button>
          `,
          showConfirmButton: false,
          didOpen: () => {
            const copiarBtn = document.getElementById('copiarEnlaceBtn');
            const enlaceInput = document.getElementById('enlaceInvitacion') as HTMLInputElement;

            // Evento para copiar el enlace al hacer clic en el botón
            copiarBtn?.addEventListener('click', () => {
              navigator.clipboard.writeText(enlaceInput.value).then(() => {
                Swal.fire('Éxito', 'Enlace copiado al portapapeles', 'success');
              }).catch((error) => {
                console.error('Error al copiar el enlace:', error);
                Swal.fire('Error', 'No se pudo copiar el enlace', 'error');
              });
            });
          }
        });
      },
      (error) => {
        console.error('Error al generar el enlace de invitación:', error);
        this.toastr.error('No se pudo generar el enlace de invitación', 'Error');
      }
    );
  }
  
  // Método para abrir el modal de añadir producto
  abrirModalAgregarProducto(indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    const modalElement = document.getElementById('productoModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Método para abrir el modal de ver más
  abrirModalVerMas(indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    this.indiceListaSeleccionada = indice;
    const modalElement = document.getElementById('verMasModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Método para abrir el modal de editar productos
  editarModal(indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    this.indiceListaSeleccionada = indice;
    const modalElement = document.getElementById('editarProductosModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Método para limpiar los campos del modal
  limpiarCamposModal() {
    this.nuevoProducto = '';
    this.unidadesPedidas = 0;
  }
  
  // Método para almacenar los valores originales
  almacenarValoresOriginales(producto: producto) {
    if (!this.valoresOriginales[producto.id]) {
      this.valoresOriginales[producto.id] = {
        udsCompradas: producto.udsCompradas,
        udsPedidas: producto.udsPedidas,
        nombre: producto.nombre,
      };
    }
  }

}

