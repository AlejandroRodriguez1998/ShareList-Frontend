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

  propietario: string = localStorage.getItem('email')!; // Propietario de las listas
  valoresOriginales: { [idProducto: string]: Partial<producto> } = {}; // Almacena los valores originales de los productos

  // Listas
  listaSeleccionada?: lista;
  indiceListaSeleccionada!: number; 
  misListas: lista[] = []; 
  nombreLista?: string; 

  // Productos
  producto? : producto;
  nuevoProducto : string = '';
  unidadesPedidas : number = 0;
  unidadesCompradas: number = 0;
  
  // Websocket para listas compartidas
  ws : WebSocket = new WebSocket('ws://localhost/wsLista?email=' + localStorage.getItem('email'));

  private timeout: any;// Temporizador para gestionar actualizaciones de productos

  constructor(private service: ListaService, private toastr: ToastrService, private invitacionService: InvitacionService) {
    // Maneja errores en la conexión WebSocket
    this.ws.onerror = (event) => console.error('Error en la conexión websocket:', event);

    // Maneja mensajes recibidos por WebSocket
    this.ws.onmessage = (event) => this.handleWebSocketMessage(event);
  }

  // Método que se ejecuta al cargar el componente
  ngOnInit() {
    this.cargarListas();
  }

  // Carga las listas desde el servicio
  cargarListas() {
    this.service.obtenerListas().subscribe(
      (listas) => {
        this.misListas = listas.map(listaData => {
          const nuevaLista = new lista();
          nuevaLista.inicializar(listaData.nombre, listaData.id, listaData.propietario);
          nuevaLista.invitaciones = listaData.invitaciones.map((inv: { emailUsuario: string; }) => ({
            ...inv,
            // Obtén la inicial del correo (primer carácter antes de '@')
            inicial: this.obtenerInicialDesdeEmail(inv.emailUsuario),
            // Genera un color aleatorio para el círculo
            color: this.generarColorAleatorio()
          }));
          nuevaLista.productos = listaData.productos;
          return nuevaLista;
        });

        console.log(this.misListas);
      },
      (error) => this.toastr.error('Error al cargar las listas', error.message)
    );
  }

  // Valida que el nombre de la lista sea válido
  private validarNombreLista(nombre?: string): boolean {
    if (!nombre || nombre.trim() === '') {
      this.toastr.info('El nombre no puede estar vacío', 'Advertencia');
      return false;
    }
    if (nombre.length > 80) {
      this.toastr.info('El nombre de la lista está limitado a 80 caracteres', 'Advertencia');
      return false;
    }
    return true;
  }

  // Agrega una nueva lista, verificando previamente el nombre
  agregarLista() {
    if (!this.validarNombreLista(this.nombreLista)) return;

    this.service.crearLista(this.nombreLista!).subscribe(
      (response) => {
        const nuevaLista = new lista();
        nuevaLista.inicializar(response.nombre!, response.id, response.propietario);
        this.misListas.push(nuevaLista);
        this.toastr.success(`La lista "${nuevaLista.nombre}" ha sido creada correctamente.`);
      },
      (error) => {
        if (error.status === 403) {
          this.mostrarLimiteAlcanzado('Los usuarios no premium solo pueden tener hasta 2 listas creadas simultáneas.', 'actualizar');
        } else {
          this.toastr.error(error.error.message, 'Error de creación');
        }
      }
    );
  }

  // Elimina una lista seleccionada por índice
  eliminarLista(index: number) {
    this.confirmarAccion('¿Estás seguro?', '¡No podrás revertir esto!', 'Eliminar', 'Cancelar')
      .then((result) => {
        if (result.isConfirmed) {
          this.service.borrarLista(this.misListas[index].id).subscribe(
            () => {
              this.misListas.splice(index, 1);
              Swal.fire('Eliminada', 'La lista ha sido eliminada.', 'success');
            },
            (error) => this.manejarErrorHttp(error, 'Hubo un problema al eliminar la lista.')
          );
        }
      });
  }

  // Valida que los campos del producto sean válidos
  private validarProducto(): boolean {
    if (!this.nuevoProducto || !this.listaSeleccionada) {
      this.limpiarCamposModal();
      this.toastr.info('El nombre del producto no puede estar vacío.', 'Advertencia');
      return false;
    }
    return true;
  }

  // Agrega un nuevo producto a la lista seleccionada
  agregarProducto() {
    if (!this.validarProducto()) return;

    const modalElement = document.getElementById('productoModal');
    const modal = bootstrap.Modal.getInstance(modalElement);

    const nuevoProducto = new producto();
    nuevoProducto.crearProducto(this.nuevoProducto, this.unidadesPedidas, this.unidadesCompradas);

    // Confirmación adicional si las unidades pedidas son 0
    if (this.unidadesPedidas === 0) {
      this.confirmarAccion('Atención', '<p>Has establecido la cantidad en 0.</p><p>¿Deseas continuar?</p>', 'Sí, continuar', 'Cancelar')
        .then((result) => {
          if (result.isConfirmed) {
            this.guardarProducto(nuevoProducto, modal);
          }
        });
    } else {
      this.guardarProducto(nuevoProducto, modal);
    }
  }

  // Método auxiliar para guardar el producto
  private guardarProducto(nuevoProducto: producto, modal: any) {
    this.service.nuevoProducto(this.listaSeleccionada!.id, nuevoProducto).subscribe(
      (response: lista) => {
        // Actualiza la lista seleccionada en misListas con la respuesta del backend
        const index = this.misListas.findIndex(lista => lista.id === this.listaSeleccionada!.id);
        if (index !== -1) this.misListas[index] = response; // Actualiza la lista completa
        
        // Ocultar el modal
        modal.hide();
        this.limpiarCamposModal();

        this.toastr.success(`El producto "${nuevoProducto.nombre}" ha sido agregado a la lista`);
      },
      (error) => {
        if (error.status === 403) {
          this.mostrarLimiteAlcanzado('Los usuarios no premium solo pueden tener hasta 10 productos en una lista.', 'actualizar');
          modal.hide();
        } else{
          console.log('Error al agregar el producto:', error);
          this.toastr.error(error.error.message, 'Error de agregación');
        }

        this.limpiarCamposModal();
      }
    );
  }

  // Valida que la cantidad comprada sea válida
  private validarCantidad(producto: producto): boolean {
    if (producto.udsCompradas == null || isNaN(producto.udsCompradas)) {
      this.toastr.info('La cantidad comprada no puede estar vacía.', 'Advertencia');
      producto.udsCompradas = this.valoresOriginales[producto.id]?.udsCompradas!;
      return false;
    }
    return true;
  }

  // Valida que la cantidad comprada no sea igual o mayor a la cantidad pedida
  private validarAntesDeActualizar(producto: producto): boolean {
    if (producto.udsCompradas == 0 && producto.udsPedidas == 0) {
      this.toastr.info('La cantidad comprada no puede ser 0.', 'Advertencia');
      return false;
    } else if (producto.udsCompradas > producto.udsPedidas) {
      this.toastr.info('La cantidad comprada no puede superar las unidades pedidas.', 'Advertencia');
      return false;
    }

    return true;
  }

  // Actualiza la cantidad comprada de un producto
  actualizarCantidadComprada(producto: producto, listaIndex: number, productoIndex: number) {
    if (!this.validarCantidad(producto)) return;

    // Evita múltiples actualizaciones simultáneas
    if (this.timeout) clearTimeout(this.timeout);

    // Esperar un tiempo antes de hacer la llamada al servidor
    this.timeout = setTimeout(() => {
      if (!this.validarAntesDeActualizar(producto)) {
        producto.udsCompradas = this.valoresOriginales[producto.id]?.udsCompradas!;
        return;
      }

      // Llamada al servicio para actualizar la cantidad comprada en el backend
      this.service.actualizarProductoComprado(producto.id, producto.udsCompradas).subscribe(
        (response) => {
          this.toastr.success(`El producto "${producto.nombre}" ha sido comprado correctamente.`);
          this.misListas[listaIndex].productos[productoIndex] = { ...response };
        },
        (error) => this.manejarErrorHttp(error, 'Error al actualizar la cantidad comprada.')
      );
    }, 500); // 500 ms de retraso
  }

  // Valida que la cantidad pedida sea válida
  private validarCantidadPedida(producto: producto): boolean {
    if (producto.udsPedidas == null || isNaN(producto.udsPedidas)) {
      this.toastr.info('La cantidad pedida no puede estar vacía.', 'Advertencia');
      producto.udsPedidas = this.valoresOriginales[producto.id].udsPedidas!;
      return false;
    }
    return true;
  }

  // Valida que el nombre del producto sea válido
  private validarNombreProducto(producto: producto): boolean {
    if (producto.nombre === "" || producto.nombre === null || producto.nombre === undefined) {
      this.toastr.info('El nombre del producto no puede estar vacío.','Advetencia');
      producto.nombre = this.valoresOriginales[producto.id].nombre!;
      return false;
    }
    return true;
  }

  // Método para actualizar un producto
  actualizarProducto(producto: producto, indexLista: number) {
    if (!this.validarCantidadPedida(producto)) return; // Validar la cantidad pedida
    if (!this.validarNombreProducto(producto)) return; // Validar el nombre del producto

    if (this.listaSeleccionada) {
      this.service.actualizarProducto(producto).subscribe( // Llama al servicio para actualizar la lista
        (response: producto) => {
          // Actualiza el producto en la lista local
          const lista = this.misListas[indexLista];
          const indexProducto = lista.productos.findIndex(p => p.id === producto.id);
          if (indexProducto !== -1) lista.productos[indexProducto] = response;
        
          this.toastr.success('Producto actualizado correctamente');
        },
        error => this.manejarErrorHttp(error, 'Error al actualizar el producto')
      );
    }
  }

  // Elimina un producto de una lista
  eliminarProducto(idProducto: string, indexLista: number, indexProducto: number) {
    this.confirmarAccion('¿Estás seguro?', '¡No podrás revertir esto!', 'Eliminar', 'Cancelar')
    .then((result) => {
      if (result.isConfirmed) {
        this.service.eliminarProducto(idProducto).subscribe(
          () => {
            this.misListas[indexLista].productos.splice(indexProducto, 1);
            Swal.fire('Eliminada', 'El producto ha sido eliminado.', 'success');
          },
          (error) => this.manejarErrorHttp(error, 'Hubo un problema al eliminar el producto.')
        );
      }
    });
  }

  // Genera un enlace de invitación para compartir una lista
  generarEnlaceInvitacion(indexLista: number) {
    const lista = this.misListas[indexLista];

    this.invitacionService.generarInvitacion(lista.id).subscribe(
      (urlInvitacion) => this.mostrarEnlaceInvitacion(urlInvitacion),
      (error) => {
        if (error.status === 403) {
          this.mostrarLimiteAlcanzado('Los usuarios no premium solo pueden generar una invitación a la vez.', 'actualizar');
        } else {
          this.toastr.error('No se pudo generar el enlace de invitación', 'Error');
        }
      }
    );
  }

  eliminarInvitacion(idInvitacion: string, listaIndex: number, invitacionIndex: number) {
    this.confirmarAccion('¿Estás seguro?', '¡No podrás revertir esto!', 'Eliminar', 'Cancelar')
    .then((result) => {
      if (result.isConfirmed) {
        this.invitacionService.eliminarInvitacion(idInvitacion).subscribe(
          () => {
            this.misListas[listaIndex].invitaciones.splice(invitacionIndex, 1);
            Swal.fire('Eliminada', 'La invitación ha sido eliminada.', 'success');
          },
          (error) => this.manejarErrorHttp(error, 'Hubo un problema al eliminar la invitación.')
        )
      }
    });
  }

  // Abre el modal para agregar un producto
  abrirModalAgregarProducto(indice: number) {
    this.abrirModal('productoModal', indice);
  }

  // Abre el modal para ver más detalles de una lista
  abrirModalVerMas(indice: number) {
    this.abrirModal('verMasModal', indice);
  }

  // Abre el modal para editar productos en una lista
  editarModal(indice: number) {
    this.abrirModal('editarProductosModal', indice);
  }

  // Método genérico para abrir modales utilizando Bootstrap
  private abrirModal(modalId: string, indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    this.indiceListaSeleccionada = indice;
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }


  // Limpia los campos del modal después de su uso
  private limpiarCamposModal() {
    this.nuevoProducto = '';
    this.unidadesPedidas = 0;
  }
  
  // Almacena los valores originales de un producto
  almacenarValoresOriginales(producto: producto) {
    if (!this.valoresOriginales[producto.id]) {
      this.valoresOriginales[producto.id] = {
        udsCompradas: producto.udsCompradas,
        udsPedidas: producto.udsPedidas,
        nombre: producto.nombre,
      };
    }
  }

  // Maneja errores genéricos
  private manejarErrorHttp(error: any, mensajeDefault: string) {
    Swal.fire('Error', error.error?.message || mensajeDefault, 'error');
  }

  // Muestra un mensaje de límite alcanzado con sugerencia de actualización
  private mostrarLimiteAlcanzado(mensaje: string, accion: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Límite alcanzado',
      html: "<p>"+ mensaje +"</p><p>Considera <a href='/Suscripcion'>" + accion + "</a> para añadir más.</p>",
      showConfirmButton: true,
      confirmButtonText: 'Entendido'
    });
  }

  // Muestra un cuadro de diálogo de confirmación
  private confirmarAccion(title: string, text: string, confirmButtonText: string, cancelButtonText: string) {
    return Swal.fire({
      title,
      html: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText
    });
  }

  // Muestra un enlace de invitación al usuario
  private mostrarEnlaceInvitacion(urlInvitacion: string) {
    Swal.fire({
      title: 'Enlace de invitación',
      html: `<p>Comparte este enlace:</p><input id="enlaceInvitacion" type="text" class="form-control" value="${urlInvitacion}" readonly>` +
        `<button id="copiarEnlaceBtn" class="btn btn-primary mt-3">Copiar enlace</button>`,
      showConfirmButton: false,
      didOpen: () => {
        const copiarBtn = document.getElementById('copiarEnlaceBtn');
        const enlaceInput = document.getElementById('enlaceInvitacion') as HTMLInputElement;
        copiarBtn?.addEventListener('click', () => {
          navigator.clipboard.writeText(enlaceInput.value)
            .then(() => Swal.fire('Éxito', 'Enlace copiado al portapapeles', 'success'))
            .catch(() => Swal.fire('Error', 'No se pudo copiar el enlace', 'error'));
        });
      }
    });
  }

  // Maneja mensajes recibidos por WebSocket
  private handleWebSocketMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    const index = this.misListas.findIndex(lista => lista.id === data.idLista);
    if (index === -1) return;

    const lista = this.misListas[index];
    switch (data.tipo) {
      case 'nuevoProducto':
        if (!lista.productos.some(producto => producto.id === data.idProducto)) {
          const nuevoProducto = new producto();
          nuevoProducto.crearProducto(data.nombre, data.udsPedidas, data.udsCompradas);
          nuevoProducto.id = data.idProducto;
          lista.productos.unshift(nuevoProducto);
        }
        break;
      case 'actualizacionProducto':
        const productoIndex = lista.productos.findIndex(producto => producto.id === data.idProducto);
        if (productoIndex !== -1) {
          lista.productos[productoIndex] = { ...lista.productos[productoIndex], ...data };
        }
        break;
      case 'borradoLista':
        this.misListas.splice(index, 1);
        break;
      case 'borradoProducto':
        lista.productos = lista.productos.filter(producto => producto.id !== data.idProducto);
        break;
    }
  }

  // Genera un color aleatorio en formato hexadecimal
  private generarColorAleatorio(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Obtiene la inicial del correo electrónico
  private obtenerInicialDesdeEmail(email: string): string {
    return email ? email.charAt(0).toUpperCase() : '?';
  }

  oirLista(index: number) {
  }
}

