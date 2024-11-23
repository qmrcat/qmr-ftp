import ftp from 'basic-ftp';
import fs from 'fs';
//import { appendFileSync } from 'fs';
import path from 'path';
//import { fileURLToPath } from 'url';
import { __filename, __dirname, baseDir  } from '../config.js'
import { writeLog, getConfig, getConnection } from './utilitats-modul.js'

async function listDownloadFiles(actionWEB = false, callback, req, res) {
    const client = new ftp.Client();
    const config = getConfig();
    const connection = getConnection()

    let OK_KO = true
    let errorKO 
    let fileList
    client.ftp.verbose = false;

    try {
        await client.access({
            host: connection.ftp.host,
            user: connection.ftp.user,
            password: connection.ftp.password,
            secure: connection.ftp.secure
        });

        writeLog("Connectat al servidor FTP", true, actionWEB);

        const remoteDir = connection.downloadRemoteDir;
        fileList = await client.list(remoteDir);
        let OK_KO = true
        
    } catch (err) {
        writeLog("Error! durant la connexió o descàrrega de fitxers: " + err, true, actionWEB);
        client.close();
        // if (callback) {
        //     callback(err, [], req, res);
        // }
        let errorKO = err
        let OK_KO = false
    } finally {
        client.close();
    }
    if (callback) {
        if (OK_KO) {
            callback(null, fileList, req, res);
        } else {
            callback(err, [], req, res);
        }
    } else {
        return fileList
    }
}

// Funció per descarregar fitxers
async function downloadFiles(listOnly = false, verbose = false, actionWEB = false, callback, req, res ) {
    const client = new ftp.Client();
    const config = getConfig();
    const connection = getConnection()

    let OK_KO = true
    let errorKO = null
    let fileList = []

    client.ftp.verbose = false; // Desactiva la sortida de consola de basic-ftp

    try {
        await client.access({
            host: connection.ftp.host,
            user: connection.ftp.user,
            password: connection.ftp.password,
            secure: connection.ftp.secure
        });

        writeLog("Connectat al servidor FTP", true, actionWEB );

        const remoteDir = connection.downloadRemoteDir                          // directori origen del servidor
        const downloadDir = path.join(process.cwd(), connection.downloadDir);   // directori local de desti
        
        // Crea el directori de descàrrega si no existeix
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        // Llista els fitxers al directori remot
        fileList = await client.list(remoteDir);

        //console.log("🚀 ~ downloadFiles ~ fileList.length:", fileList.length, (fileList.length === 0))
        if (fileList.length === 0) {
            writeLog("No hi ha cap fitxer per descarregar.", true, actionWEB );
        } else {
            for (const file of fileList) {
                if (file.isFile) {
                    const remoteFilePath = path.posix.join(remoteDir, file.name);
                    const localFilePath = path.join(downloadDir, file.name);

                    // Comprova si el fitxer existeix localment
                    let shouldDownload = true;
                    if (fs.existsSync(localFilePath)) {
                        const localFileStats = fs.statSync(localFilePath);
                        const remoteFileStats = await client.lastMod(remoteFilePath);

                        // Si el fitxer local és més nou, no el descarreguem
                        if (localFileStats.mtime > remoteFileStats) {
                            writeLog(`El fitxer local ${file.name} és més nou que el del servidor. No es descarregarà.`, true, actionWEB );
                            shouldDownload = false;
                        }
                    }

                    if (listOnly) {
                        if (shouldDownload) {
                            console.log(`Fitxer pendent de descarregar: ${file.name}`);
                        }
                    } else if (shouldDownload) {
                        writeLog(`Descarregant ${file.name} a ${localFilePath}`, true, actionWEB );
                        await client.downloadTo(localFilePath, remoteFilePath);

                        // Si la descàrrega s'ha completat i deleteAfterDownload és true, elimina el fitxer del servidor
                        if (connection.deleteAfterDownload) {
                            writeLog(`Eliminant ${file.name} del servidor després de la descàrrega.`, true, actionWEB );
                            await client.remove(remoteFilePath);
                        }
                    }
                }
            }

            if (!listOnly) {
                writeLog("Tots els fitxers necessaris han estat descarregats correctament", true, actionWEB );
            } 
        }
        let OK_KO = true
    } catch (err) {
        writeLog("Error! durant la connexió o descàrrega de fitxers: " + err, true, actionWEB );
        let OK_KO = false
        let errorKO = err
    } finally {
        client.close();
    }
    if (callback) {
        if (OK_KO) {
            callback(null, fileList, req, res);
        } else {
            callback(err, [], req, res);
        }
    }
    // if ( verbose ){
    //     return ''
    // }
    
}

export {
    downloadFiles,
    listDownloadFiles,
}