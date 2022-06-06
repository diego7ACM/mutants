import { connect } from 'mongoose';

/**
 * Funcion usada para la conexion a DB mongo
 *
 * @author Diego Sarmiento - Jun, 05-2022
 * @version 1.0.0 
 *
 * @returns Retorna el acceso a la DB
 */
export async function startConnection() {
    return await connect('mongodb+srv://meli:meli@mutants.3vvek.mongodb.net/mutants?retryWrites=true&w=majority');
}
