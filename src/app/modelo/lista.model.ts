import { producto } from "./producto.model";

export class lista {
    id: string;
    nombre: string;
    productos : producto[];

    constructor(){
        this.id = "";
        this.nombre = "";
        this.productos = [];
    }
}