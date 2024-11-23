import ftp from 'basic-ftp';
import { appendFileSync } from 'fs';
import fs from 'fs';
import PromiseFtp from 'promise-ftp';
import path from 'path';
import { configPath, __filename, __dirname, baseDir } from '../config.js'
import { connectionPath } from '../connection.js'

// let missatgeProces = ''

function getConfig() {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function getConnection() {
    return JSON.parse(fs.readFileSync(connectionPath, 'utf-8'));
}

// missatgeProces

function setWriteMessageProces(message){
    //console.log("🚀 ~ setWriteMessageProces ~ message:", message)
    process.env.missatgeProces += `<p>${message}</p>`
    // missatgeProces += `<p>${message}</p>`
}
function getWriteMessageProces(){
    //console.log("🚀 ~ getWriteMessageProces ~ missatgeProces:", process.env.missatgeProces)
    return process.env.missatgeProces
}
function iniWriteMessageProces(){
    process.env.missatgeProces = ''
    //console.log("🚀 ~ iniWriteMessageProces ~ missatgeProces:", process.env.missatgeProces)
}

function writeLog( message, isDown = false, actionWEB = false) {
    
    const logFilePath = path.join(__dirname, 'app.log');
    const timestamp = new Date().toISOString();
    appendFileSync(logFilePath, `[${timestamp}] ${isDown ? 'Download' : 'Upload  ' }: ${message}\n`);
    if ( actionWEB ){
        setWriteMessageProces(message)
    }
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

function getFilesPending( numberFilesOnly=false ) {
    const config = getConfig();
    const connection = getConnection()
    const directoryPath = path.join( baseDir, connection.localDir );

    try {
        // Llegeix el contingut del directori de manera síncrona
        const files = fs.readdirSync(directoryPath);

        // Mapeja cada fitxer amb la seva data de modificació i tamany
        let numberFiles = 0
        const fileDetails = files.map(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath); // Obté les estadístiques del fitxer
            numberFiles++
            if (!numberFilesOnly){ 
                return {
                    name: file,
                    size: formatFileSize(stats.size), // Tamany del fitxer en bytes
                    modifiedDate: formatDate(stats.mtime) // Data de modificació
                };
            }
        });
        if (numberFilesOnly) {
            return numberFiles
        }
        return fileDetails;

    } catch (err) {
        console.error(`Error al llegir el directori: ${err.message}`);
        if (numberFilesOnly) {
            return -1
        }
        return [];
    }
}


function decodeBase64Filename(encodedFilename) {
    try {
        // Descodifica el nom del fitxer de Base64 i després de URL encoding
        return decodeURIComponent(Buffer.from(encodedFilename, 'base64').toString('utf-8'));
    } catch (error) {
        console.error('Error descodificant el nom del fitxer:', error);
        return encodedFilename; // Retorna el nom codificat si hi ha un error
    }
}


function generateHtmlTableLog(filePath) {
    // Llegeix el fitxer
    const content = fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line.trim() !== '');

    // Capgira les línies
    const reversedContent = content.reverse();

    // Genera la taula HTML amb Tailwind CSS
    let htmlTable = `
    <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
            <thead>
                <tr class="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th class="py-3 px-6 text-left">Registres del log</th>
                </tr>
            </thead>
            <tbody class="text-gray-600 text-sm font-light">
    `;

    reversedContent.forEach(line => {
        htmlTable += `
                <tr class="border-b border-gray-200 hover:bg-gray-100">
                    <td class="py-3 px-6 text-left whitespace-nowrap">${line}</td>
                </tr>
        `;
    });

    htmlTable += `
            </tbody>
        </table>
    </div>
    `;

    return htmlTable;
}

function esAdmin(){
    return process.env.admin
}

export {
    writeLog,
    getConfig,
    getFilesPending,
    getWriteMessageProces,    
    iniWriteMessageProces,
    generateHtmlTableLog,
    formatFileSize,
    formatDate,
    decodeBase64Filename,
    getConnection,
    esAdmin,
}