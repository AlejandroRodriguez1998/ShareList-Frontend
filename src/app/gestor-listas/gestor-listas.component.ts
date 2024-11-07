import { producto } from '../modelo/producto.model';
import { ListaService } from '../lista.service';
import { CommonModule } from '@angular/common';
import { lista } from '../modelo/lista.model';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; // Avisos emergentes
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

declare var bootstrap: any; // Para usar los modales de Bootstrap

@Component({
  selector: 'app-gestor-listas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestor-listas.component.html',
  styleUrl: './gestor-listas.component.css'
})
export class GestorListasComponent {

  listaSeleccionada?: lista; // Lista seleccionada para añadir productos
  misListas: lista[] = []; // Listas del usuario
  nombreLista?: string; // Nombre de la lista a crear

  // Productos
  producto? : producto;
  nuevoProducto : string = '';
  unidadesPedidas : number = 0;
  unidadesCompradas: number = 0;
  
  // Websocket para listas compartidas
  ws : WebSocket = new WebSocket('ws://localhost/wsLista?email=' + localStorage.getItem('email'));

  constructor(private service: ListaService, private toastr: ToastrService) {

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
      this.toastr.error('El nombre no puede estar vacio', 'Error en la creación');
    }else if(this.nombreLista === ""){
      this.toastr.error('El nombre no puede estar vacio', 'Error en la creación');
    }else if (this.nombreLista.length > 80) {
      this.toastr.error('El nombre de la lista no puede superar los 80 caracteres', 'Error en la creación');
    }

    this.service.crearLista(this.nombreLista!).subscribe(
      (response) => {
        let listaCreada = new lista();
        listaCreada.id = response.id;
        listaCreada.nombre = response.nombre;

        this.misListas.push(listaCreada);
        this.toastr.success(`La lista "${listaCreada.nombre}" ha sido creada correctamente.`, '');
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
          this.toastr.error(error.error.message, 'Error en la creación');
          console.error('Error en añadir la lista: ', error.error.message);
        }
      }
    );
  }

  // Método para añadir un producto a la lista
  agregarProducto() {
    if (this.nuevoProducto && this.listaSeleccionada) {
      const modalElement = document.getElementById('productoModal');
      const modal = bootstrap.Modal.getInstance(modalElement);

      console.log(`Voy a almacenar producto: "${this.nuevoProducto}"`);

      const nuevoProducto = new producto(); // Crear una nueva instancia de producto cada vez
      nuevoProducto.crearProducto(this.nuevoProducto, this.unidadesPedidas, this.unidadesCompradas);

      this.service.nuevoProducto(this.listaSeleccionada.id, nuevoProducto).subscribe(
        (response) => {
          console.log('Producto agregado correctamente:', response);

          const index = this.misListas.findIndex(lista => lista.id === this.listaSeleccionada!.id);
          if (index !== -1) {
            if (!this.misListas[index].productos) {
              this.misListas[index].productos = []; // Inicializa el array si no está definido
            }
            this.misListas[index].productos.push(nuevoProducto); // Añadir el nuevo producto
          }

          // Ocultar el modal
          modal.hide();
          this.limpiarCamposModal();

          this.toastr.success(`El producto "${nuevoProducto.nombre}" ha sido agregado a la lista`, '');

        },
        (error) => {
          switch (error.status) {
            case 400:
              this.toastr.error(error.error.message, 'Error al agregar producto');
              break;
            case 401:
              this.toastr.error('No tienes permisos para añadir productos a esta lista', 'Error al agregar producto');
              break;
            case 403:
              Swal.fire({
                icon: 'warning',
                title: 'Límite alcanzado',
                html: '<p>Los usuarios <strong>no premium</strong> solo pueden tener hasta 10 productos en una lista.</p>' +
                      '<p>Considera <a href="/Suscripcion">actualizar</a> para añadir más productos.</p>',
                showConfirmButton: true,
                confirmButtonText: 'Entendido'
              });
              modal.hide();
              break;
            case 404:
              this.toastr.error('La lista seleccionada no existe', 'Error al agregar producto');
              break;
            default:
              console.error('Error al almacenar el producto:', error);
              this.toastr.error(`Hubo un error al agregar el producto "${nuevoProducto.nombre}" a la lista`, 'Error al agregar producto');
          }

          this.limpiarCamposModal();
        }
      );
    } else {
      if (this.nuevoProducto === "") {
        this.toastr.error('El nombre del producto no puede estar vacío.', 'Error al agregar producto');
      } else {
        this.toastr.error(`Hubo algún problema. Inténtalo de nuevo.`, 'Error al agregar producto');
        console.error('Faltan datos para crear el producto o no hay lista seleccionada');
      }

      this.limpiarCamposModal();
    }
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
            switch (error.status) {
              case 401:
                Swal.fire(
                  'Advertencia',
                  'No tienes permisos para eliminar la lista.',
                  'warning'
                );
                break;
              case 400:
                Swal.fire(
                  'Advertencia',
                  error.error.message,
                  'warning'
                );
                break;
              default:
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

  // Método para abrir el modal de añadir producto
  abrirModal(indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    const modalElement = document.getElementById('productoModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Método para abrir el modal de ver más
  abrirModalVerMas(indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    const modalElement = document.getElementById('verMasModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Método para limpiar los campos del modal
  limpiarCamposModal() {
    this.nuevoProducto = '';
    this.unidadesPedidas = 0;
  }
  
}

