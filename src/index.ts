import {App} from './app';
import { startConnection } from './database';

/**
 * Metodo que establece la conexion del proyecto
 */
async function main() {
    // Se realiza la conexion a db
    startConnection();

    // Se inicia la pp con un puerto definido
    const app = new App(process.env.PORT || 3000);
    // Se llama al escucha de la app
    await app.listen();
}

main();
