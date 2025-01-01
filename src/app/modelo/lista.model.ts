import { producto } from "./producto.model";

export class lista {
    id: string;
    nombre: string;
    propietario: string;
    productos : producto[];
    invitaciones: any;
    
    constructor(){
        this.id = "";
        this.nombre = "";
        this.propietario = "";
        this.productos = [];
    }

    inicializar(nombre:string, id:string, propietario:string){
        this.id = id;
        this.nombre = nombre;
        this.propietario = propietario;
    }
}