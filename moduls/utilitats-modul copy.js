import ftp from 'basic-ftp';
import { appendFileSync } from 'fs';
import fs from 'fs';

import { configPath, __filename, __dirname, baseDir } from './config.js'


function getConfig() {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}


function writeLog(message, isDown=false) {
    const logFilePath = path.join(__dirname, 'app.log');
    const timestamp = new Date().toISOString();
    appendFileSync(logFilePath, `[${timestamp}] ${isDown ? 'Download' : 'Upload  ' }: ${message}\n`);
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Els mesos comencen des de 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}.${minutes}`;
}

function getFilesPending() {
    const config = getConfig();
    const directoryPath = path.join( baseDir, config.localDir );
    // try {
    //     // Llegeix el contingut del directori de manera síncrona
    //     const files = fs.readdirSync(directoryPath);
    //     return files;
    // } catch (err) {
    //     console.error(`Error al llegir el directori: ${err.message}`);
    //     return [];
    // }
    try {
        // Llegeix el contingut del directori de manera síncrona
        const files = fs.readdirSync(directoryPath);

        // Mapeja cada fitxer amb la seva data de modificació i tamany
        const fileDetails = files.map(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath); // Obté les estadístiques del fitxer

            return {
                name: file,
                size: formatFileSize(stats.size), // Tamany del fitxer en bytes
                modifiedDate: formatDate(stats.mtime) // Data de modificació
            };
        });

        return fileDetails;
    } catch (err) {
        console.error(`Error al llegir el directori: ${err.message}`);
        return [];
    }
}

// async function _isFtpServerOnline() {
//     const client = new ftp.Client();
//     const config = getConfig();
    
//     try {
//         await client.access({
//             host: config.ftp.host,
//             user: config.ftp.user,
//             password: config.ftp.password,
//             secure: config.ftp.secure
//         });
//         // Si la connexió és reeixida, el servidor està en línia
//         return true;
//     } catch (err) {
//         // Si hi ha un error, el servidor està fora de línia
//         return false;
//     } finally {
//         client.close();
//     }

// }

// async function isFtpServerOnline() {
//     const isOnline = await _isFtpServerOnline();
//     console.log(`El servidor FTP està ${isOnline ? "actiu (ON)" : "inactiu (OFF)"}`);
//     return isOnline
// }


async function estatServidor() {
    const client = new ftp.Client();
    const config = getConfig();

    try {
        await client.access({
            host: config.ftp.host,
            user: config.ftp.user,
            password: config.ftp.password,
            secure: config.ftp.secure
        });
        // Si la connexió és reeixida, el servidor està en línia
        return true;
    } catch (err) {
        // Si hi ha un error, el servidor està fora de línia
        return false;
    } finally {
        client.close();
    }
}


async function __checkFtpServerStatus(timeout = 5000) {
    const client = new Client();
    const config = getConfig();
  
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        client.end();
        resolve(false); // Servidor offline si hi ha timeout
      }, timeout);
  
      client.on('ready', () => {
        clearTimeout(timer);
        client.end();
        resolve(true); // Servidor online
      });
  
      client.on('error', (err) => {
        clearTimeout(timer);
        client.end();
        console.error('Error de connexió FTP:', err);
        resolve(false); // Servidor offline o error de connexió
      });
  
      // Intenta connectar-se al servidor
      client.connect({
        host: config.ftp.host,
        user: config.ftp.user,
        password: config.ftp.password,
        secure: config.ftp.secure
      });
    });
  }
  async function checkFtpServerStatus(timeout = 5000) {
    const client = new Client(timeout / 1000);
    const config = getConfig();
  
    try {
      await client.access({
        host: config.ftp.host,
        user: config.ftp.user,
        password: config.ftp.password,
        secure: config.ftp.secure
      });
      return true; // Servidor online
    } catch (err) {
      console.error('Error de connexió FTP:', err);
      return false; // Servidor offline o error de connexió
    } finally {
      client.close();
    }
  }
export {
    writeLog,
    getConfig,
    getFilesPending,
    estatServidor,
    checkFtpServerStatus,
}