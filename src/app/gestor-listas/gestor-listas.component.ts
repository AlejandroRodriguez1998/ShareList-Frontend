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
  producto : producto = new producto;
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
    }

    this.service.crearLista(this.nombreLista!).subscribe(
      (response) => {
        let listaCreada = new lista();
        listaCreada.id = response.id;
        listaCreada.nombre = response.nombre;

        this.misListas.push(listaCreada);
        this.toastr.success(`La lista "${listaCreada.nombre}" ha sido creada.`, 'Correcto');
        console.log('Nueva Lista añadida', listaCreada);
      },
      (error) => {
        this.toastr.error(error.error.message, 'Error en la creación');
        console.error('Error en añadir la lista: ', error.error.message);
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
        //Añadir metodo de borrado
        Swal.fire(
          'Eliminada',
          'La lista ha sido eliminada.',
          'success'
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

  // Método para añadir un producto a la lista
  agregarProducto() {
    if (this.nuevoProducto && this.listaSeleccionada) {
      console.log(`Voy a almacenar producto: "${this.nuevoProducto}"`);
  
      this.producto.crearProducto(this.nuevoProducto, this.unidadesPedidas, this.unidadesCompradas);
  
      this.service.aniadirProducto(this.listaSeleccionada.id, this.producto).subscribe(
        (response) => {
          console.log('Producto agregado correctamente:', response);
          this.nuevoProducto = '';
  
          const index = this.misListas.findIndex(lista => lista.id === this.listaSeleccionada!.id);
          if (index !== -1) {
            if (this.misListas[index].productos) {
              this.misListas[index].productos.push(this.producto);
            }
          }

          const modalElement = document.getElementById('productoModal');
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal.hide();

          this.toastr.success(`El producto "${this.producto.nombre}" ha sido agregado a la lista`, 'Producto agregado correctamente');

        },
        (error) => {
          this.toastr.error(`Hubo un error al agregar el producto "${this.producto.nombre}" a la lista`, 'Error al agregar producto');
          console.error('Error al almacenar el producto:', error);
        }
      );
    } else {
      if(this.nuevoProducto === ""){
        //Añadir logica de modal y mensajes de error
      }else {
        this.toastr.error(`Hubo algún problema. Inténtalo de nuevo.`, 'Error al agregar producto');
        console.error('Faltan datos para crear el producto o no hay lista seleccionada');
      }
    }
  }

}