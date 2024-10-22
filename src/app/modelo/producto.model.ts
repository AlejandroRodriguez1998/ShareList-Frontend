export class producto {
    nombre: string;
    udsPedidas: number;
    udsCompradas: number;

    constructor(){
        this.nombre = "";
        this.udsPedidas = 0;
        this.udsCompradas = 0;
    }

    crearProducto(nombre: string, unidadesPedidas: number, unidadesRecibidas: number){
        this.nombre = nombre;
        this.udsPedidas = unidadesPedidas;
        this.udsCompradas = unidadesRecibidas;
    }
}