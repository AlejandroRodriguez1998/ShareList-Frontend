export class producto {
    id!: string;
    nombre: string;
    udsPedidas: number;
    udsCompradas: number;
    udsPendientes: number; // Nuevo campo
    udsCompraTemporal!: number;
  
    constructor() {
      this.id = '';
      this.nombre = '';
      this.udsPedidas = 0;
      this.udsCompradas = 0;
      this.udsPendientes = 0; // Inicializamos como 0
    }
  
    crearProducto(nombre: string, unidadesPedidas: number, unidadesCompradas: number) {
      this.nombre = nombre;
      this.udsPedidas = unidadesPedidas;
      this.udsCompradas = unidadesCompradas;
      this.udsPendientes = unidadesPedidas - unidadesCompradas; // Calculamos pendientes
    }
}