import * as bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import http from 'http';
import morgan from 'morgan';
import path from 'path';

import Routes from './routes/index';

/**
 * Clase principal del proyecto para la configuracion de acceso
 */
export class App {

    private app: Application;

    /**
     * Constructor de la clase
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @param port Puerto por donde es ejecutado el proyecto
     */
    constructor(
        private port?: number | string,
    ) {
        // Se hace el llamado de express
        this.app = express();
        // Se configura el limite de los payloads en los request
        this.app.use(bodyParser.json({ limit: '50mb' }));
        // Se hace el uso de cors para que el cliente pueda consumir los servicios
        this.app.use(cors());
        // Se realiza la configuracion de las cabeceras
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'content-type');
            next();
        });
        // Se ejecutan los metodos que contienen las configuraciones de la app
        this._routes();
        this._settings();
        this._middlewares();

    }

    /**
     * Metodo que configura el puerto de ejecucion del proyecto
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     */
    private _settings() {
        this.app.set('port', this.port || process.env.PORT || 3000);
    }

    /**
     * Metodo que configura los middlewares
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     */
    private _middlewares() {
        this.app.use(morgan('dev'));
        this.app.use(express.json());
    }

    /**
     * Metodo que expone las rutas del proyecto
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     */
    private _routes() {
        this.app.use('/', new Routes().createRoutesDna());
    }

    /**
     * Metodo que escucha el puerto en el cual es ejecutado el proyecto
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     */
    async listen(): Promise<void> {
        await this.app.listen(this.app.get('port'));
        console.log('Server on port', this.app.get('port'));
    }

    /**
     * Se obtiene la instancia de la clase app
     *
     * @author Diego Sarmiento - Jun, 05-2022
     * @version 1.0.0
     *
     * @returns la intancia de la app
     */
    public getApp(){
        return this.app;
    }
}
