import fs from 'fs';
import multer from 'multer';
import path from 'path';
import os from 'os';
// import http from 'http';
// import https from 'https';
import ipify from 'ipify'
//import { writeLog, getConfig  } from './utilitats-modul.js'
import { configFilePath, configPath, baseDir  } from '../config.js'
import { connectionPath, connectionFilePath, fileDefaultConnection, } from '../connection.js'
import { writeLog, getConfig, decodeBase64Filename, getConnection} from './utilitats-modul.js';
// Definim el fitxer de configuració i la ruta
//const configFilePath = path.resolve('./config.json');


// Funció per llegir i analitzar el fitxer connexio.json
const readConnection = () => {

  if (fs.existsSync(connectionFilePath)) {
    const rawConnection = fs.readFileSync(connectionFilePath);
    return JSON.parse(rawConnection);
  }
  return {};

}

// Funció per escriure al fitxer config.json
const writeConnexio = (connection) => {
  fs.writeFileSync(connectionFilePath, JSON.stringify(connection, null, 2));
}


// Funció per llegir i analitzar el fitxer config.json
const readConfig = () => {
  
  if (fs.existsSync(configFilePath)) {
    const rawConfig = fs.readFileSync(configFilePath);
    return JSON.parse(rawConfig);
  }
  return {};
}


// Funció per escriure al fitxer config.json
const writeConfig = (config) => {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}


function tancarServidor(server){
  console.log("Tancant el servidor...");
  server.close(() => {
      console.log("Servidor tancat.");
      process.exit(0);
  });
}


function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let localIP = '127.0.0.1'; // Valor per defecte, en cas de no trobar la IP

  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName];

    for (const alias of iface) {
      // Busquem una IP que comenci per 192.168.x.x o 10.x.x.x, que solen ser les xarxes locals
      if (alias.family === 'IPv4' && !alias.internal && 
         (alias.address.startsWith('192.168.') || alias.address.startsWith('10.'))) {
        localIP = alias.address;
        break;
      }
    }

    if (localIP !== '127.0.0.1') {
      break; // Sortim si hem trobat la IP correcta
    }
  }

  return localIP;
}


function activeMulter(){

  const config = getConfig();
  const connection = getConnection()

  //console.log("🚀 ~ activeMulter ~ connection:", connection)
  const localDir = path.join(baseDir, connection.localDir);
  //console.log("🚀 ~ activeMulter ~ localDir:", localDir)

  return multer.diskStorage({
    destination: (req, file, cb) => {
      // cb(null, path.join(__dirname, 'uploads/')); // Directori on es guardaran els fitxers
      cb(null, path.join(localDir + '/')); // Directori on es guardaran els fitxers
    },
    filename: (req, file, cb) => {
      const decodedFilename = decodeBase64Filename(file.originalname);
      //const uniqueFilename = `${Date.now()}-${decodedFilename}`;
      const uniqueFilename = `${decodedFilename}`;
      //cb(null, `${Date.now()}-${file.originalname}`);
      cb(null, uniqueFilename);
    },
  });

}


function activarAdminArgs(){
  const args = process.argv.slice( 2 );
  if ( args.includes( '--admin' ) ) {
      return true
  } 
  return false
}


export {
    writeConfig,
    readConfig,
    tancarServidor,
    getLocalIP,
    activeMulter,
    activarAdminArgs,
    readConnection,
    writeConnexio,
    // getPublicIp
}

