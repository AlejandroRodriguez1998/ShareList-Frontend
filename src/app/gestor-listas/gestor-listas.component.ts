import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../lista.service';
import { lista } from '../modelo/lista.model';
import { producto } from '../modelo/producto.model';

//Para los avisos
import { ToastrService } from 'ngx-toastr';
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

  nuevaLista?: string;
  misListas: lista[] = [];
  listaSeleccionada?: lista;
  nuevoProducto : string='';
  unidadesPedidas : number=0;
  unidadesCompradas: number=0;
  producto : producto = new producto;
  ws: WebSocket = new WebSocket('ws://localhost:80/wsListas');

  constructor(private service: ListaService, private toastr: ToastrService) {

    this.ws.onerror = function (event) {
      alert(event)
    }

    this.ws.onmessage = function (event) {
      let data = event.data;
      data = JSON.parse(data);

      if (data.tipo == "actualizacionDeLista") {
        console.log(data.nombre);
      }
    }

  }

  ngOnInit() {
    this.cargarListas();
  }

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

  agregarLista() {
    this.service.crearLista(this.nuevaLista!).subscribe(
      (response) => {
        let listaCreada = new lista();
        listaCreada.id = response.id;
        listaCreada.nombre = response.nombre;

        this.misListas.push(listaCreada);
        this.toastr.success(`La lista "${listaCreada.nombre}" ha sido creada.`, 'Lista creada correctamente');
        console.log('Nueva Lista añadida', listaCreada);
      },
      (error) => {
        this.toastr.error('Hubo un error al crear la lista', 'Error en la creación');
        console.error('Error en añadir la lista', error);
      }
    );
  }

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

  abrirModal(indice: number) {
    this.listaSeleccionada = this.misListas[indice];
    const modalElement = document.getElementById('productoModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

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