import { Request, Response } from 'express';
import { Query } from 'mongoose';

import Logger from '../lib/logger';
import Dna from '../models/dna.model';

export default class DnaController {

    /**
     * Metodo que muestra un mensaje en la pagina inicial
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param req request de la peticion
     * @param res response de la peticion
     * @returns Mensaje de confirmacion de guardado
     */
    public returnMessageHome = async (req: Request, res: Response) => {

        // Se retorna la respuesta al cliente
        return res.json({
            message: 'Welcome'
        });
    }

    /**
     * Metodo que verifica si la estructura del dna es valido
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param req request de la peticion
     * @param res response de la peticion
     * @returns Mensaje de confirmacion del dna
     */
    public verifyDna = async (req: Request, res: Response) => {
        // Se obtienen los datos enviados desde el cliente
        const {
            dna
        } = req.body;

        // Se inicializa el objeto dna para darse uso al registro en db
        const dnaMutant = new Dna();
        // Se agrega al objeto la propiedad del dna
        dnaMutant.dna = dna;

        // Se declaran los caracteres validos del dna
        const validDna = 'ATCG';

        // Se declara la variable isValid para indicar con ella si el dna ingresado es valido
        let isValid = true;
        // Se recorren los arreglos del dna
        for (const dnaArray of dnaMutant.dna) {
            // Valida si el tamanio de los arreglos son iguales
            if (dnaArray.length !== dnaMutant.dna[0].length) {
                // Si los tamanios no son iguales, no es un dna valido y se rompe el ciclo para
                // indicarle al usuario que el dna no se puede procesar
                isValid = false;
                break;
            }

            // Recorre cada caracter del arreglo del dna
            for (const dnaCode of dnaArray) {
                // Se valida si el caracter del dna ingresado esta incluido en los caracteres predefinidos del dna
                isValid = validDna.includes(dnaCode);
                // De no ser valido, se rompe el ciclo
                if (!isValid) {
                    break;
                }
            }

            // De no ser valido el dna, se rompe el ciclo para retornar al cliente el mensaje que no es valido el dna ingresado
            if (!isValid) {
                break;
            }
        }

        // Se crea la variable del mesaje que se va a retornar al cliente
        let message = 'The dna is not valid';
        // Si no es valido se cambia el status de la peticion
        if (!isValid) {
            res.status(403);
            Logger.error(`Error 403: ${message} - ${dna}`);
        } else {
            // Si es valido el dna, se busca en db si existe
            const searchDna = await Dna.findOne({ dna: dna });
            // De no existir, se comprueba si es mutante el dns
            if (!searchDna) {
                const isMutant = await this.isMutant(dna);
                dnaMutant.isMutant = isMutant;

                // Se guarda en db
                await dnaMutant.save();
                // Se devuelve el status 200 al cliente
                Logger.info(`The dna ${dnaMutant._id} has been created correctly`);
                res.status(200);
                message = 'The dna has been saved';
            } else {
                // En caso que ya exista el dna, se retorna un mensaje al cliente
                // indicando la existencia del dna en db
                message = 'The dna is already in db';
                Logger.error(`Error 403: ${message} - ${dna}`);
                res.status(403);
            }
        }

        // Se retorna la respuesta al cliente
        return res.json({
            message
        });
    }

    /**
     * Metodo que indica si es mutante o no el dna
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param dna arreglo que contiene el dna
     * @returns si es mutante o no el dna
     */
    public async isMutant(dna: string[]): Promise<boolean> {
        // Obtiene las coincidencias de las secuencias del dna horizontalmente
        const dnaHorizontal = await this._verifyHorizontalDna(dna);

        // Si hay mas de una coincidencia, se retorna indicando que es mutante
        if (dnaHorizontal.length > 1) {
            return true;
        }

        // Obtiene las coincidencias de las secuencias del dna verticalmente
        const dnaVertical = await this._verifyVerticalDna(dna);
        // Se suman el total de coincidencias hasta el momento de los recorridos por la matriz
        let totalCodesDna = dnaHorizontal.length + dnaVertical.length;

        // Si hay mas de una coincidencia, se retorna indicando que es mutante
        if (totalCodesDna > 1) {
            return true;
        }

        // Obtiene las coincidencias de las secuencias del dna en la transversal izquierda
        const dnaLeftTransverse = await this._verifyLeftTransverseDna(dna);
        // Se suman el total de coincidencias hasta el momento de los recorridos por la matriz
        totalCodesDna += dnaLeftTransverse.length;

        // Si hay mas de una coincidencia, se retorna indicando que es mutante
        if (totalCodesDna > 1) {
            return true;
        }

        // Obtiene las coincidencias de las secuencias del dna en la transversal derecha
        const dnaRightTransverse = await this._verifyRightTransverseDna(dna);
        // Se suman el total de coincidencias hasta el momento de los recorridos por la matriz
        totalCodesDna += dnaRightTransverse.length;

        // Si hay mas de una coincidencia, se retorna indicando que es mutante
        if (totalCodesDna > 1) {
            return true;
        }

        // Se indica que el dna no es mutante
        return false;
    }

    /**
     * Metodo que busca las secuencias de caracteres seguidas horizontalmente
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param dna arreglo que contiene el dna
     * @returns los caracteres que cumplen la secuencia
     */
    private _verifyHorizontalDna(dna: string[]): Promise<Array<string>> {
        return new Promise((resolve) => {
            // Se inicializa el arreglo dnaValid para almacenar los caracteres que cumplen la secuencia
            // de 4 letras seguidas horizontalmente
            const dnaValid = [];
            // Se inicializa un contador para validar el numero de caracteres seguidos horizontalmente
            let codeDnaValid = 0;
            // Se recorre cada arreglo del dna
            for (const codeDna of dna) {
                // Se recorre cada caracter del dna horizontalmente
                for (let i = 0, j = 1; i < codeDna.length, j < codeDna.length - 1; i++, j++) {
                    // Valida la posicion actual y la posicion proxima del arreglo para aumentar el contador de caracteres seguidos
                    if (codeDna[i] === codeDna[j]) {
                        // Aumenta la cantidad de caracteres seguidos
                        codeDnaValid++;
                    }

                    // Si el total de codeDnaValid es 3, es porque hay una secuencia de 4 caracteres seguidos
                    if (codeDnaValid === 3) {
                        // Si en esa posicion existe un dato, se agrega
                        if (typeof codeDna[i] !== 'undefined') {
                            // Se agrega el caracter al arreglo para indicar que cumple con la secuencia
                            dnaValid.push(codeDna[i]);
                        }
                        // Se inializa el contador
                        codeDnaValid = 0;
                    }
                }
                // Se inializa el contador
                codeDnaValid = 0;
            }

            // Se retornan los caracteres que cumplen la secuencia
            resolve(dnaValid);
        });
    }

    /**
     * Metodo que busca las secuencias de caracteres seguidas verticalmente
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param dna arreglo que contiene el dna
     * @returns los caracteres que cumplen la secuencia
     */
    private _verifyVerticalDna(dna: string[]): Promise<Array<string>> {
        return new Promise((resolve) => {
            // Se inicializa el arreglo dnaValid para almacenar los caracteres que cumplen la secuencia
            // de 4 letras seguidas verticalmente
            const dnaValid = [];
            // Se inicializa un contador para validar el numero de caracteres seguidos verticalmente
            let codeDnaValid = 0;
            // Se recorre cada caracter del dna verticalmente
            for (let k = 0; k < dna.length; k++) {
                for (let i = 0, j = 1; i < dna.length - 1, j < dna.length; i++, j++) {
                    // Valida la posicion actual y la posicion proxima del arreglo para aumentar el contador de caracteres seguidos
                    if (dna[i][k] === dna[j][k]) {
                        // Aumenta la cantidad de caracteres seguidos
                        codeDnaValid++;
                    }

                    // Si el total de codeDnaValid es 3, es porque hay una secuencia de 4 caracteres seguidos
                    if (codeDnaValid === 3) {
                        if (typeof dna[i][k] !== 'undefined') {
                            // Si en esa posicion existe un dato, se agrega
                            dnaValid.push(dna[i][k]);
                        }

                        // Se inializa el contador
                        codeDnaValid = 0;
                    }
                }
                // Se inializa el contador
                codeDnaValid = 0;
            }

            // Se retornan los caracteres que cumplen la secuencia
            resolve(dnaValid);
        });
    }

    /**
     * Metodo que busca las secuencias de caracteres seguidas en la trasnversal izquierda
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param dna arreglo que contiene el dna
     * @returns los caracteres que cumplen la secuencia
     */
    private _verifyLeftTransverseDna(dna: string[]): Promise<Array<string>> {
        return new Promise((resolve) => {
            // Se inicializa el arreglo dnaValid para almacenar los caracteres que cumplen la secuencia
            // de 4 letras seguidas transversal izquierdo
            const dnaValid = [];
            // Se inicializa un contador para validar el numero de caracteres seguidos transversal izquierdo
            let codeDnaValid = 0;
            // Se recorre cada caracter del dna transversal izquierdo
            for (let j = dna[0].length - 1; j >= 1 - dna[0].length; j -= 1) {
                for (let i = Math.max(0, j), k = -Math.min(0, j); i < dna.length && k < dna[0].length; i += 1, k += 1) {
                    // Se crea una nueva variable que contiene al iterador siguiente horizontalmente
                    const iteratorJ = k + 1;
                    // Se crea una nueva variable que contiene al iterador siguiente verticalmente
                    const iteratorI = i + 1;
                    // Se inicializa la variable contenedora del resultado
                    let resultCodeDna = '';

                    // Se valida que al obtener el resultado de la variable no exista un error de desborde
                    try {
                        // Se obtiene el caracter de la diagonal
                        resultCodeDna = dna[iteratorI][iteratorJ];
                    } catch (error) {
                        // Al existir un error de desborde, se continua con el proceso
                        Logger.error(`Error: ${error}`);
                    }

                    // Valida la posicion actual y la posicion proxima del arreglo para aumentar el contador de caracteres seguidos
                    if (dna[i][k] === resultCodeDna) {
                        codeDnaValid++;
                    }

                    // Si el total de codeDnaValid es 3, es porque hay una secuencia de 4 caracteres seguidos
                    if (codeDnaValid === 3) {
                        if (typeof dna[i][k] !== 'undefined') {
                            // Si en esa posicion existe un dato, se agrega
                            dnaValid.push(dna[i][k]);
                        }
                        // Se inializa el contador
                        codeDnaValid = 0;
                    }
                }
                // Se inializa el contador
                codeDnaValid = 0;
            }

            // Se retornan los caracteres que cumplen la secuencia
            resolve(dnaValid);
        });
    }

    /**
     * Metodo que busca las secuencias de caracteres seguidas en la trasnversal derecha
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param dna arreglo que contiene el dna
     * @returns los caracteres que cumplen la secuencia
     */
    private _verifyRightTransverseDna(dna: string[]): Promise<Array<string>> {
        return new Promise((resolve) => {
            // Se inicializa el arreglo dnaValid para almacenar los caracteres que cumplen la secuencia
            // de 4 letras seguidas transversal derecho
            const dnaValid = [];
            // Se inicializa un contador para validar el numero de caracteres seguidos transversal derecho
            let codeDnaValid = 0;
            // Se recorre cada caracter del dna transversal derecho
            for (let i = 0; i < (dna.length + dna[0].length - 1); i++) {
                for (var j, k = Math.min(i, dna[0].length - 1); k >= 0 && (j = i - k) < dna.length; k--) {
                    // Se crea una nueva variable que contiene al iterador siguiente horizontalmente
                    const iteratorJ = j + 1;
                    // Se crea una nueva variable que contiene al iterador siguiente verticalmente
                    const iteratorI = k - 1;
                    // Se inicializa la variable contenedora del resultado
                    var resultCodeDna = '';

                    // Se valida que al obtener el resultado de la variable no exista un error de desborde
                    try {
                        // Se obtiene el caracter de la diagonal
                        resultCodeDna = dna[iteratorI][iteratorJ];
                    } catch (error) {
                        // Al existir un error de desborde, se continua con el proceso
                        Logger.error(`Error: ${error}`);
                    }

                    // Valida la posicion actual y la posicion proxima del arreglo para aumentar el contador de caracteres seguidos
                    if (dna[k][j] === resultCodeDna) {
                        codeDnaValid++;
                    }

                    // Si el total de codeDnaValid es 3, es porque hay una secuencia de 4 caracteres seguidos
                    if (codeDnaValid === 3) {
                        if (typeof dna[k][j] !== 'undefined') {
                            // Si en esa posicion existe un dato, se agrega
                            dnaValid.push(dna[k][j]);
                        }
                        // Se inializa el contador
                        codeDnaValid = 0;
                    }
                }
                // Se inializa el contador
                codeDnaValid = 0;
            }
            // Se retornan los caracteres que cumplen la secuencia
            resolve(dnaValid);
        });
    }

    /**
     * Metodo que retorna las estadisticas de los dna's reportados
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param req request de la peticion
     * @param res response de la peticion
     * @returns Mensaje de estadisticas de los dna's registrados
     */
    public calculateStats = async (req: Request, res: Response) => {

        // Consulta que retorna la cantidad de dna's de mutantes, humanos y el porcentaje de dna's de mutantes
        const query = [
            {
                '$group': {
                    '_id': 'dna',
                    'count_mutant_dna': {
                        '$sum': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$isMutant', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    },
                    'count_human_dna': {
                        '$sum': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$isMutant', false
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    }
                }
            }, {
                '$addFields': {
                    'ratio': {
                        '$divide': [
                            '$count_mutant_dna', 100
                        ]
                    }
                }
            }
        ];

        // Se consulta a db el query
        const result = await Dna.aggregate(query);
        // Se retorna la respuesta al cliente
        return res.json({
            result
        });
    }
}
