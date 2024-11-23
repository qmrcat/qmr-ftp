import { Client } from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { __filename, __dirname, baseDir } from '../config.js';
import { writeLog, getConfig, getConnection } from './utilitats-modul.js';

function uploadFiles(verbose = false, actionWEB = false, listOnly = false, callback, req, res) {
    const client = new Client();
    const config = getConfig();
    const connection = getConnection()

    client.ftp.verbose = false;

    client.access({
        host: connection.ftp.host,
        user: connection.ftp.user,
        password: connection.ftp.password,
        secure: connection.ftp.secure
    }).then(() => {
        writeLog("Connectat al servidor FTP", false, actionWEB);

        const localDir = path.join(baseDir, connection.localDir);
        const files = fs.readdirSync(localDir);

        if (!listOnly) {
            (function uploadNext(i) {
                if (i >= files.length) {
                    client.close();
                    writeLog("Processament complet", false, actionWEB);
                    if (callback) callback(null, files, req, res);
                    return;
                }

                const file = files[i];
                const filePath = path.join(localDir, file);
                const stats = fs.lstatSync(filePath);
                if (stats.isFile()) {
                    const remoteFilePath = connection.remoteDir + '/' + file;

                    const uploadFile = () => {
                        writeLog(`Pujant ${file} a ${connection.remoteDir}`, false, actionWEB);
                        client.uploadFrom(filePath, remoteFilePath).then(() => {
                            if (connection.deleteAfterUpload) {
                                writeLog(`Eliminant ${file} després de la pujada.`, false, actionWEB);
                                fs.unlinkSync(filePath);
                            }
                            uploadNext(i + 1);
                        }).catch(err => {
                            writeLog(`Error al pujar el fitxer: ${err.message}`, false, actionWEB);
                            uploadNext(i + 1);
                        });
                    };

                    client.size(remoteFilePath).then(fileDetails => {
                        if (fileDetails) {
                            const localFileStats = fs.statSync(filePath);
                            client.lastMod(remoteFilePath).then(remoteFileStats => {
                                if (localFileStats.mtime > remoteFileStats) {
                                    writeLog(`El fitxer local ${file} és més nou que el del servidor. Eliminant el fitxer del servidor...`, false, actionWEB);
                                    client.remove(remoteFilePath).then(() => {
                                        uploadFile();
                                    }).catch(err => {
                                        writeLog(`Error al eliminar el fitxer al servidor: ${err.message}`, false, actionWEB);
                                        uploadNext(i + 1);
                                    });
                                } else {
                                    writeLog(`El fitxer al servidor és més nou o igual, no es pujarà ${file}.`, false, actionWEB);
                                    uploadNext(i + 1);
                                }
                            }).catch(err => {
                                writeLog(`Error al obtenir la data de modificació del fitxer al servidor: ${err.message}`, false, actionWEB);
                                uploadNext(i + 1);
                            });
                        } else {
                            uploadFile();
                        }
                    }).catch(err => {
                        if (err.code !== 550) {
                            writeLog(`Error al comprovar l'existència del fitxer al servidor: ${err.message}`, false, actionWEB);
                            uploadNext(i + 1);
                        } else {
                            writeLog(`El fitxer ${file} no existeix al servidor, es pujarà.`, false, actionWEB);
                            uploadFile();
                        }
                    });

                } else {
                    uploadNext(i + 1);
                }
            })(0);
        } else {
            client.close();
            if (callback) callback(null, files, req, res);
        }
    }).catch(err => {
        client.close();
        writeLog(`Error! durant la connexió o pujada de fitxers: ${err}`, false, actionWEB);
        if (callback) callback(err, null, req, res);
    });
}


export { uploadFiles };
