import { Router } from 'express';

import DnaController from '../controllers/dna.controller';

/**
 * Clase que contiene las rutas de acceso a la api
 *
 * @author Diego Sarmiento - Jun, 05-2022
 * @version 1.0.0 
 */
export default class Routes {
    
    dnaController: DnaController = new DnaController();

    /*
    Inicializacion del componente router, para hacer uso de rutas en la api
    */
    router: Router = Router();

    /**
     * Constructor de la clase
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0 
     */
    constructor() {
    }
    
    public createRoutesDna() {
        this.router.get('/', this.dnaController.returnMessageHome);
        return this.router;
    }
}
