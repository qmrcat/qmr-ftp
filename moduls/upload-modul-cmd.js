import { Client } from 'basic-ftp';
import fs from 'fs/promises';
import path from 'path';
import { __filename, __dirname, baseDir  } from '../config.js'
import { writeLog, getConfig  } from './utilitats-modul.js'

async function uploadFilesCmd( verbose = false, actionWEB = false, listOnly = false ) {
    
    const client = new Client();
    const config = getConfig();
    client.ftp.verbose = false;
    try {
        await client.access({
            host: config.ftp.host,
            user: config.ftp.user,
            password: config.ftp.password,
            secure: config.ftp.secure
        });
        writeLog( "Connectat al servidor FTP", false, actionWEB );

        const localDir = path.join( baseDir, config.localDir );
        const files = await fs.readdir( localDir );

        if ( !listOnly ) {
            for ( const file of files ) {
            
                const filePath = path.join( localDir, file );
                const stats = await fs.lstat( filePath );
                if ( stats.isFile() ) {
                    const remoteFilePath = config.remoteDir + '/' + file;
                    let shouldUpload = true;
                    try {
                        const fileDetails = await client.size( remoteFilePath );
                        if (fileDetails) {
                            const localFileStats = await fs.stat( filePath );
                            const remoteFileStats = await client.lastMod( remoteFilePath );
                            if ( localFileStats.mtime > remoteFileStats ) {
                                writeLog( `El fitxer local ${file} és més nou que el del servidor. Eliminant el fitxer del servidor...`, false, actionWEB );
                                await client.remove( remoteFilePath );
                            } else {
                                writeLog( `El fitxer al servidor és més nou o igual, no es pujarà ${file}.`, false, actionWEB  );
                                shouldUpload = false;
                            }
                        }
                    } catch ( err ) {
                        if ( err.code !== 550 ) {
                            writeLog( `Error al comprovar l'existència del fitxer al servidor: ${err.message}`, false, actionWEB  );
                            shouldUpload = false;
                        } else {
                            writeLog( `El fitxer ${file} no existeix al servidor, es pujarà.`, false, actionWEB  );
                        }
                    }
                    if ( shouldUpload ) {
                        writeLog( `Pujant ${file} a ${config.remoteDir}`, false, actionWEB  );
                        await client.uploadFrom( filePath, remoteFilePath );
                        if ( config.deleteAfterUpload ) {
                            writeLog(`Eliminant ${file} després de la pujada.`, false, actionWEB );
                            await fs.unlink( filePath );
                        }
                    }
                }
            }
        } 
        writeLog( "Processament complet", false, actionWEB  );
    } catch ( err ) {
        writeLog( `Error! durant la connexió o pujada de fitxers: ${err}`, false, actionWEB );
    } finally {
        client.close();
    }

    if ( listOnly ) {
        return files
    }
    if ( verbose ){
        return ''
    }
}

export {
    uploadFilesCmd,
}