import { model, Schema } from 'mongoose';

import IDna from '../interfaces/dna.interface';

/**
 * Modelo de la tabla identification type en DB
 *
 * @author Diego Sarmiento - Jun, 05-2022
 * @version 1.0.0 
 */
const schema = new Schema(
    {
        dna: [String],
        isMutant: Boolean,
    },
    {
        versionKey: false
    }
);

// Se exporta el modelo para hacer uso de este en el proyecto
export default model<IDna>('dna', schema);