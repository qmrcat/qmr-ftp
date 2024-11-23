import { log } from 'console';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );
const baseDir = __dirname;

const fileDefaultConfig = 'config.json'

const configPath = path.join( process.cwd(), './'+fileDefaultConfig );
const configFilePath = path.resolve('./'+fileDefaultConfig);

export {
    configPath,
    configFilePath,
    __filename,
    __dirname,
    baseDir,
    fileDefaultConfig,
}