//import { getLocalIP } from './server-modul.js'
import path from 'path';

import { getFilesPending, generateHtmlTableLog, formatFileSize, formatDate } from './utilitats-modul.js'
import { __filename, __dirname, baseDir, configFilePath, fileDefaultConfig } from '../config.js';
import { connectionPath, connectionFilePath, fileDefaultConnection, } from '../connection.js'
//import { llistatFitxersBaixada } from '../download.js'
import { listDownloadFiles } from './download-modul.js'

// async function comprovaEstat() {
//   const isOnline = await estatServidor();
//   return isOnline;
// }

// async function estatServer(){
//   // let estatus = 
//   // (async () => {
//   //   let estat = await comprovaEstat();
//   //   // Ara `estat` conté `true` o `false` segons l'estat del servidor
//   //   // Pots fer servir aquest valor en altres llocs de la teva aplicació
//   //   return estat
//   // })();

//   // console.log("🚀 ~ estatServer ~ estatus:",estatus)
//   // return estatus

//   const isOnline = await checkFtpServerStatus();
//   console.log(isOnline ? 'El servidor FTP està en línia' : 'El servidor FTP està fora de línia');
// }
function htmlTableLog(){
    const filePath = path.join(__dirname, 'app.log');
    return generateHtmlTableLog(filePath);
}

function htmlTableFilesPending(files){
  // name: file,
  // size: stats.size, // Tamany del fitxer en bytes
  // modifiedDate: stats.mtime // Data de modificació

    let HTML = `
        <table class="min-w-full bg-white border border-gray-200">
            <tbody id="fileTableBody">
    `
    files.forEach(file => {
        HTML += `
            <tr>
              <td class="py-2 px-4 border-b border-gray-200">${file.name}</td>
              <td class="py-2 px-4 border-b border-gray-200">${file.modifiedDate}</td>
              <td class="py-2 px-4 border-b border-gray-200">${file.size}</td>
            </tr>
        `;
    });

    HTML += `
        </tbody>
      </table>
    `
    return HTML
}

function htmlTableFilesPendingServer(files){
  //console.log("🚀 ~ htmlTableFilesPendingServer ~ files:", files)
  // name: file,
  // size: stats.size, // Tamany del fitxer en bytes
  // modifiedDate: stats.mtime // Data de modificació
  let HTML = ''
  let HTML_BODY = ''


      for (let i = 0; i < files.length; i++) {
        HTML_BODY += `
            <tr>
              <td class="py-2 px-4 border-b border-gray-200">${files[i].name}</td>
              <td class="py-2 px-4 border-b border-gray-200">${formatDate(files[i].modifiedAt)}</td>
              <td class="py-2 px-4 border-b border-gray-200">${formatFileSize(files[i].size)}</td>
            </tr>
        `;
        
      }

    if (HTML_BODY){
      HTML = `
      <table class="min-w-full bg-white border border-gray-200">
          <tbody id="fileTableBody"> 
            ${HTML_BODY}
          </tbody>
        </table>
      `
    }

    return HTML
}

function infoFilesPendingInitFinale(error, result, req, res){

  process.env.pendingFilesDownload = result.length
  //res.send(webBaixar(result))
  res.send(webInici())
}

async function infoFilesPendingInit(req, res){
  
  process.env.pendingFilesUpload = getFilesPending(true)

  
  await listDownloadFiles(false, infoFilesPendingInitFinale, req, res)

}

function getHead( titleHead = '',  styleHead = '' ){
  return `

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleHead}</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
  <link rel="manifest" href="/images/site.webmanifest">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    ${styleHead}
  </style>
</head>
`
}

function getComponentWebTitlePage( msgTitle = 'QMR-FTP' ){
  return `
    <div class="flex justify-center items-center">
      <div class="bg-white p-6 mt-3 rounded-lg shadow-md w-full max-w-4xl">
          <h1 class="text-2xl font-bold text-center">${msgTitle}</h1>
      </div>
    </div>
  `
}

function getComponentWebUploadFiles(){

  return `
      <div id="drop-area" class="bg-white p-8 mb-6 rounded-lg shadow-md mx-auto">
        <h2 class="text-2xl font-bold mb-1 text-center text-gray-800">Desar els fitxers a la carpeta local</h2>
        <p class="text-xl font-bold mb-4 text-center text-gray-800">No s'envien automàticament al servidor</p>
        <form id="uploadForm" enctype="multipart/form-data" class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg px-6 pt-6 pb-8 text-center cursor-pointer hover:border-blue-500 transition duration-300">
                <p class="text-gray-600 mb-4">Arrossega els fitxers aquí o</p>
                <input type="file" id="fileElem" name="filesEnviar" multiple accept="*/*" class="hidden">
                <label for="fileElem" class="bg-blue-500 text-white py-2 px-4 mb-5 rounded hover:bg-blue-600 transition duration-300 cursor-pointer">selecciona'ls</label>
            </div>
            <div class="flex justify-between">
                <button type="submit" id="submitBtn" class="w-full bg-green-500 text-white py-2 px-4 mr-4 rounded hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Pujar Fitxers</button>
                <button type="button" id="clearBtn" class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Netejar</button>
            </div>
        </form>
        <div id="file-list" class="mt-4 space-y-2"></div>
        <div id="upload-progress" class="mt-4 text-center text-gray-600"></div>
        <!-- <div id="result" class="mt-6 bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto"></div> -->
        <div id="result" class="mt-5 bg-white p-1 max-w-xl mx-auto hidden"></div>
      </div>
  `
}
function getComponentWebUploadFilesScript(){

  return `
      <script defer src='/src/js/qmr-upload-files.js'></script>
  `
}

    // let msg = ''
    // if (error) {
    //     //console.error('S\'ha produït un error:', error);
    //     msg = "S'ha produït un error: "+ error
    //     res.send(webMissatge(msg + getWriteMessageProces()))
    // } else {
    //     // console.log('Operació completada amb èxit.');
    //     // if (result) {
    //     //     console.log('Fitxers processats:', result);
    //     // }
    //     res.send(webBaixar(result))
    // }


// async function getEstatServidor() {
//   const estat = await comprovaEstatServidor();
//   estatServidor = 'OFF'
//   if (estat) {
//       // El servidor està actiu (estat és true)
//       // Pots realitzar alguna acció quan el servidor està actiu
//       estatServidor = 'ON'
//   } 
  
// }
/*
<li><a href="/inici" class="text-lg hover:text-green-400 transition-colors duration-300"><span class="menu-item-text">Inici</span></a></li>
<li><a href="/config" class="text-lg hover:text-green-400 transition-colors duration-300"><span class="menu-item-text">Configuració</span></a></li>
<li><a href="/pujar" class="text-lg hover:text-green-400 transition-colors duration-300"><span class="menu-item-text">Pujar fitxers</span></a></li>
<li><a href="/baixar" class="text-lg hover:text-green-400 transition-colors duration-300"><span class="menu-item-text">Baixar fitxers</span></a></li>
<li><a href="/log" class="text-lg hover:text-green-400 transition-colors duration-300"><span class="menu-item-text">Transaccions</span></a></li>
<li><a href="/exit" class="text-lg hover:text-green-400 transition-colors duration-300"><span class="menu-item-text">Exit</span></a></li>
*/

function webMenu(){

  const opMenu  = {
    op1: {
        title: 'Inici',
        href: '/inici'
    },
    op2: {
      title: 'Connexio',
      href: '/connexio'
    },
    op3: {
      title: 'Pujar fitxers',
      href: '/pujar'
    },
    op4: {
      title: 'Baixar fitxers',
      href: '/baixar'
    },
    op5: {
      title: 'Transaccions',
      href: '/log'
    },
    op6: {
      title: 'Exit',
      href: '/exit'
    },
  }
  console.log("🚀 ~ webMenu ~ opMenu:", opMenu)

  let menuPC = ''
  let menuMob = ''

  for (let key in opMenu) {
        
    menuPC += `
      <a href="${opMenu[key].href}" class="border-transparent text-gray-300 hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">${opMenu[key].title}</a>
    `
    menuMob += `
      <a href="${opMenu[key].href}" class="border-transparent text-gray-300 hover:bg-gray-600 hover:border-gray-300 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">${opMenu[key].title}</a>
    `

  }


  return `
  <nav class="bg-gray-800 border-b border-gray-700  sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <!-- Logo -->
                        <a href="/inici">
                          <img class="h-8 w-8 rounded-full" src="/images/favicon-32x32.png" alt="QMR/FTP">
                        </a>
                    </div>
                    <div class="flex items-center ml-4">
                        <!-- Títol -->
                        <a href="/inici">
                          <h1 class="text-xl font-bold text-white">QMR/FTP</h1>
                        </a>
                    </div>
                </div>
                <div class="-mr-2 flex items-center sm:hidden">
                    <!-- Botó menú hamburguesa -->
                    <button type="button" id="menu-toggle" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white" aria-controls="mobile-menu" aria-expanded="false">
                        <span class="sr-only">Obre el menú principal</span>
                        <!-- Icona del menú hamburguesa -->
                        <svg class="h-6 w-6" id="icon-hamburger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        <!-- Icona del menú tancament (signe 'X') -->
                        <svg class="h-6 w-6 hidden" id="icon-close" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <!-- Opcions del menú -->
                    ${menuPC}                                                      
                </div>
            </div>
        </div>

        <!-- Menú desplegable mòbil (inicialment amagat) -->
        <div class="sm:hidden hidden" id="mobile-menu">
            <div class="pt-2 pb-3 space-y-1">
                ${menuMob} 
            </div>
        </div>
    </nav>

    <script>
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const iconHamburger = document.getElementById('icon-hamburger');
        const iconClose = document.getElementById('icon-close');

        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            iconHamburger.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });
    </script>
  `

}


function webInici(){

  let infoPendingFilesUpload = 'Actualment, no hi ha cap fitxer pendent de pujar al servidor'
  if (process.env.pendingFilesUpload > 0){
    infoPendingFilesUpload = `Hi ha <b>${process.env.pendingFilesUpload}</b> fitxers per pujar al servidor`
  }

  let infoPendingFilesDownload = 'Actualment, No hi ha cap fitxer pendent de baixar de servidor'
  if (process.env.pendingFilesDownload > 0 ){
    infoPendingFilesDownload = `Hi ha <b>${process.env.pendingFilesDownload }</b> fitxers per baixar del servidor`
  }

  //let infoEditarConfig = 'EL fitxer de cofiguracio es: ' + fileDefaultConfig
  let infoEditarConnection = 'El fitxer de les dades de connexio es: <b>' + fileDefaultConnection + '</b>'
  
  const styleHead = `    
    /* Classe per ressaltar l'àrea de deixar fitxers */
    .highlight {
        border-color: #3b82f6; /* Color blau per ressaltar */
        background-color: #e0f2fe; /* Fons blau clar per ressaltar */
    }
  `

  const webHtml = 
`<!DOCTYPE html>
<html lang="ca">
${getHead( 'Configurar FTP',  styleHead )}
<body class="bg-gray-100">
  ${webMenu()}
  ${getComponentWebTitlePage('QMR FTP')}
  <div class="flex flex-col justify-center items-center">
    <div class=" p-0 mt-3 w-full max-w-4xl  ">
      <div id="grid-container" class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 transition-transform duration-300 hover:-translate-y-1 flex flex-col h-full">
              <h2 class="editable text-2xl font-bold mb-4" contenteditable="false">Local</h2>
              <p class="editable mb-4" contenteditable="false">${infoPendingFilesUpload}</p>
              <div class="mt-auto">
                <a href="/pujar" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Pujar fitxers</a>
              </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 transition-transform duration-300 hover:-translate-y-1 flex flex-col h-full">
              <h2 class="editable text-2xl font-bold mb-4" contenteditable="false">Servidor</h2>
              <p class="editable mb-4" contenteditable="false">${infoPendingFilesDownload}</p>
              <div class="mt-auto">
                <a href="/baixar" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Baixar fitxers</a>
              </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 transition-transform duration-300 hover:-translate-y-1 flex flex-col h-full">
              <h2 class="editable text-2xl font-bold mb-4" contenteditable="false">Connexió</h2>
              <p class="editable mb-4" contenteditable="false">${infoEditarConnection}</p>
              <div class="mt-auto">
                <a href="/connexio" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Editar la connexió</a>
              </div>
        </div>
      </div>
    </div>
    <div class=" p-0 mt-3 w-full max-w-4xl  ">
      ${getComponentWebUploadFiles()}
    </div>
  </div>
  ${getComponentWebUploadFilesScript()}
</body>
</html>`

/* 
<button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
Pujar
</button> 
*/

  return webHtml
}


function webFormulariConnexio(connection){
    return `
        <script>
            function togglePasswordVisibility() {
            const passwordField = document.getElementById('password');
            const toggleCheckbox = document.getElementById('showPassword');
            if (toggleCheckbox.checked) {
                passwordField.type = 'text';
            } else {
                passwordField.type = 'password';
            }
            }
        </script>
        <form action="/connexio-save" method="POST" autocomplete="off">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 border-t-4 pt-4">
              <div class="mb-2">
                <label for="Servidor FTP" class="block text-gray-700">Host:</label>
                <input type="text" id="host" name="ftp.host" value="${connection.ftp?.host || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>
              <div class="mb-2">
                <label for="user" class="block text-gray-700">Port de connexió:</label>
                <input type="number" id="port" name="ftp.port" value="${connection.ftp?.port || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>
              
              <div class="mb-2">
                <label for="user" class="block text-gray-700">Usuari:</label>
                <input type="text" id="user" name="ftp.user" value="${connection.ftp?.user || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>
              
              <div class="mb-2">
                <label for="password" class="block text-gray-700">Contrasenya:</label>
                <input type="password" id="password" name="ftp.password" value="${connection.ftp?.password || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="new-password">
                <div class="mt-2">
                  <input type="checkbox" id="showPassword" onclick="togglePasswordVisibility()" class="mr-2">
                  <label for="showPassword" class="text-sm text-gray-600">Mostra la contrasenya</label>
                </div>
              </div>
              
              <div class="mb-2">
                <label for="secure" class="block text-gray-700">Connexió segura:</label>
                <input type="checkbox" id="secure" name="ftp.secure" class="mr-2 leading-tight" ${connection.ftp?.secure ? 'checked' : ''}>
                <span class="text-sm">Habilita connexió segura</span>
                <p class="text-sm">Atenció! Aquesta opció en alguns servidors no funciona.</p>
              </div>
            </div>
              
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 border-t-4 mt-4 pt-4">  
              <div class="mb-2">
                <label for="localDir" class="block text-gray-700">Directori local fixers a pujar:</label>
                <input type="text" id="localDir" name="localDir" value="${connection.localDir || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>
  
              <div class="mb-2">
                <label for="remoteDir" class="block text-gray-700">Directori remot pujades (servidor):</label>
                <input type="text" id="remoteDir" name="remoteDir" value="${connection.remoteDir || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>
              <div class="mb-2">
                <label for="downloadRemoteDir" class="block text-gray-700">Directori remot baixades (servidor):</label>
                <input type="text" id="downloadRemoteDir" name="downloadRemoteDir" value="${connection.downloadRemoteDir || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>
              <div class="mb-2">
                <label for="downloadDir" class="block text-gray-700">Directori local de descàrrega de fitxers:</label>
                <input type="text" id="downloadDir" name="downloadDir" value="${connection.downloadDir || ''}" class="w-full p-2 border border-gray-300 rounded mt-2" required autocomplete="off">
              </div>

            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 border-t-4 mt-4 pt-4">     
              <div class="mb-2">
                <label for="deleteAfterUpload" class="block text-gray-700">Esborrar després de pujar:</label>
                <input type="checkbox" id="deleteAfterUpload" name="deleteAfterUpload" class="mr-2 leading-tight" ${connection.deleteAfterUpload ? 'checked' : ''}>
                <span class="text-sm">Esborra els fitxers després de pujar-los</span>
                <p class="text-sm">Atenció! Els elimina si s'han pujat correctament.</p>
              </div>
              <div class="mb-2">
                <label for="deleteAfterDownload" class="block text-gray-700">Esborrar després de baixar:</label>
                <input type="checkbox" id="deleteAfterDownload" name="deleteAfterDownload" class="mr-2 leading-tight" ${connection.deleteAfterDownload ? 'checked' : ''}>
                <span class="text-sm">Esborra els fitxers del servidor després de baixar-los</span>
                <p class="text-sm">Atenció! Els elimina si s'han baixat correctament.</p>
              </div>

              <div class="mb-3 md:col-span-2">
                <label for="Observacions" class="block text-gray-700">Observacions:</label>
                <textarea id="Observacions" name="Observacions" class="w-full p-2 border border-gray-300 rounded mt-2" rows="4">${connection.Observacions || ''}</textarea>
              </div>
            </div>
            
            <div class="flex justify-center mt-4 border-t-4 pt-4">
              <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">Desar</button>
            </div>
          </form>
    `
}

//function webConfig(connection){
function webConnexio(connection){
    const webHtml = 
`<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar FTP</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    ${webMenu()}
    <div class="flex justify-center items-center">
        <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
            <h1 class="text-2xl font-bold mb-2 text-center">Connexió FTP</h1>
            <h2 class="text-xl font-bold mb-6 text-center">${fileDefaultConnection}</h2>
            
            ${webFormulariConnexio(connection)}

        </div>
    </div>
</body>
</html>`

    return webHtml
}

function webMissatge(missatge = '', insertMenu = true ){
    const webHtml = 
`<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar FTP</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    ${insertMenu ? webMenu() : ''}
    <div class="flex justify-center items-center">
        <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
            <h1 class="text-2xl font-bold mb-6 text-center">${missatge}</h1>
            
        </div>
    </div>
</body>
</html>`

    return webHtml
}

function webLog( ){
  const webHtml = 
`<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configurar FTP</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
  ${webMenu()}
  <div class="flex justify-center items-center">
      <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
          <h1 class="text-2xl font-bold mb-6 text-center">LOG de les operacions de càrrega i descàrrega</h1>
          ${htmlTableLog()}
      </div>
  </div>
</body>
</html>`

  return webHtml
}





function webPujar(){

  const numFiles = getFilesPending(true)
  const webForm = `
          <form action="/upload" method="POST" autocomplete="off">
            <div class="flex justify-center mt-4 border-t-4 pt-4">
              <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">Enviar fitxers al servidor</button>
            </div>
          </form>
  `

  const webHtml = 
`<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar FTP</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    ${webMenu()}
    <div class="flex flex-col justify-center items-center">
      
        <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
            <h1 class="text-2xl font-bold mb-6 text-center">QMR FTP - 
            <span class="text-xl font-bold mb-6 text-center">PUJAR FITXERS</span></h1>
        </div>
        <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
          <h3 class="text-xl font-bold mb-6 text-center">FITXERS PENDENT D'ENVIAR AL SERVIDOR</h3>
          <div class="bg-white p-8 mt-3 border-t-4 w-full ">
            ${htmlTableFilesPending(getFilesPending())}
          </div>
          ${(numFiles > 0) ? webForm : '<h2>No existeixen fitxer per pujar al servidor</h2>'}
        </div>
      
    </div>  

</body>
</html>`

    return webHtml
}


function webBaixar(listFiles){
 
  const webHTMLFiles = htmlTableFilesPendingServer([...listFiles])
  // numFiles = listFiles.length
  
  const webForm = `
  <form action="/download" method="POST" autocomplete="off">
    <div class="flex justify-center mt-4 border-t-4 pt-4">
      <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">Baixar els fitxers del servidor</button>
    </div>
  </form>
`

  const webHtml = 

`<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar FTP</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    ${webMenu()}
    <div class="flex flex-col justify-center items-center">
        <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
            <h1 class="text-2xl font-bold mb-6 text-center">QMR FTP - <span class="text-xl font-bold mb-6 text-center">BAIXAR FITXERS</span></h1>
            <h3 class="text-xl font-bold mb-6 text-center">BAIXAR FITXERS</h3>
        </div>
        <div class="bg-white p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl">
          <h3 class="text-xl font-bold mb-6 text-center">FITXERS PENDENT DE BAIXAR DEL SERVIDOR</h3>
          <div class="bg-white p-8 mt-3 border-t-4 w-full ">
            ${webHTMLFiles}
          </div>
          ${(webHTMLFiles) ? webForm : '<h2>No existeixen fitxer per pujar al servidor</h2>'}
        </div>
    </div>
</body>
</html>`

    return webHtml
}

function webExit(){
  return webMissatge('Tancament del servidor (shutdown) <br><p>Pots tancar aquesta pestanya</p>', false)
  
}

export {
    //webConfig, //->> webConnection
    webMissatge,
    webInici,
    webPujar,
    webBaixar,
    webExit,
    webLog,
    infoFilesPendingInit,
    webConnexio,
}