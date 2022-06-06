import { Document } from 'mongoose'

/**
 * Interfaz del tipo de identificacion
 *
 * @author Diego Sarmiento - Jun, 05-2022
 * @version 1.0.0 
 */
export default interface IDna extends Document {

    /*
    Contiene el dna
    */
    dna: string[];

    /*
    Indica si el dna es de un mutante
    */
    isMutant: boolean;
}