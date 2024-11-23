import { log } from 'console';
import path from 'path';
import { fileURLToPath } from 'url';

// const __filename = fileURLToPath( import.meta.url );
// const __dirname = path.dirname( __filename );
// const baseDir = __dirname;

const fileDefaultConnection = 'connexio.json'

const connectionPath = path.join( process.cwd(), './connexions/'+fileDefaultConnection );
const connectionFilePath = path.resolve('./connexions/'+fileDefaultConnection);

export {
    connectionPath,
    connectionFilePath,
    fileDefaultConnection,
}