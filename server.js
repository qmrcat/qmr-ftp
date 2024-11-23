import express from 'express';
import multer from 'multer';
import path from 'path';
// import { fileURLToPath } from 'url';
import open from 'open';
import getPort from 'get-port';
// import { exec } from 'child_process';
// import { writeFileSync } from 'fs';
// import { resolve } from 'path';

import { getWriteMessageProces, iniWriteMessageProces, esAdmin, getConnection } from './moduls/utilitats-modul.js'
//import { writeLog, getConfig, getConnection } from './utilitats-modul.js'
import { writeConfig, readConfig, tancarServidor, getLocalIP, activeMulter, activarAdminArgs, readConnection, writeConnexio } from './moduls/server-modul.js'
import { webMissatge, webInici, webPujar, webBaixar, webExit, webLog, infoFilesPendingInit, webConnexio } from './moduls/web-moduls.js'

import { baixarFitxers, llistatFitxersBaixada } from './download.js'
import { pujarFitxers } from './upload.js'
import { __filename, __dirname } from './config.js';

process.env.missatgeProces = ''
process.env.pendingFilesUpload = 0
process.env.pendingFilesDownload = 0
process.env.admin = false

activarAdminArgs()

if( esAdmin() ){
  console.log( "Administrador activat" );
}

let server
const autoOpen = false
const autoClose = false

// console.log("🚀 ~ __dirname:", __dirname)
// console.log("🚀 ~ path.join(__dirname, 'filesmulter/'):", path.join(__dirname, '../filesmulter/'))

const storage = activeMulter()

const upload = multer({ storage: storage });



// Funció per iniciar el servidor
const startServer = async () => {
  const app = express();
  const port = await getPort({ port: 3000 });

  // Permetre el parseig de JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static(path.join(__dirname, 'public')));

  // Middleware per registrar totes les sol·licituds
  app.use((req, res, next) => {
    console.log(`Sol·licitud rebuda: ${req.method} ${req.url}`);
    //console.log('Headers:', req.headers);
    next();
  });

  // Ruta GET per obtenir la configuració
  app.get('/export-config', (req, res) => {
    //const config = readConfig();
    const connexio = readConnection();
    res.json(connexio);
  });

  app.get('/connexio', (req, res) => {
    const connexio = readConnection();
    //res.send(webConfig(connexio))
    res.send(webConnexio(connexio))
  });

  app.get('/pujar', (req, res) => {
    // const config = readConfig();
    res.send(webPujar())
  });
  app.get('/baixar', (req, res) => {
    // const config = readConfig();
    // res.send(webBaixar())
    llistatFitxersBaixada( false, req, res )
  });  
  app.get('/log', (req, res) => {
    // const config = readConfig();
    res.send(webLog())
  }); 
  app.get('/exit', (req, res) => {
    // const config = readConfig();
    if (autoClose) {
      res.send(webExit())
      tancarServidor(server)
    } else {
      webMissatge("Opció no disponible.")
    }
  }); 
  app.get('/inici', (req, res) => {
    // const config = readConfig();
    //res.send(webInici())
    infoFilesPendingInit(req, res)
  });
  app.get('/', (req, res) => {
    // const config = readConfig();
    //res.send(webInici())
    infoFilesPendingInit(req, res)
  });
  

  app.post('/upload-drag', upload.array('filesEnviar', 10), (req, res) => {

    console.log('Petició rebuda a /upload-drag');
    
    if (!req.files || req.files.length === 0) {
        console.log('No s\'ha rebut cap fitxer');
        return res.status(400).send(webMissatge("No s'ha rebut cap fitxer."));
    }
    
    console.log('Fitxers rebuts:', req.files.length);
    
    const fileDetails = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size
    }));
    
    res.json({
        message: `S'han pujat ${req.files.length} fitxers correctament!`,
        files: fileDetails
    });
  });

  app.post('/upload', (req, res) => {
    iniWriteMessageProces()
    pujarFitxers(false, true, req, res)
  })
  app.post('/download', (req, res) => {
    iniWriteMessageProces()
    baixarFitxers( false, req, res )
  })

  // Ruta POST per actualitzar la configuració
  app.post('/connexio-save', (req, res) => {
    const newConnexio = {
      ftp: {
        host: req.body['ftp.host'],
        user: req.body['ftp.user'],
        password: req.body['ftp.password'],
        secure: req.body['ftp.secure'] === 'on',
        port: req.body['ftp.port'] || 21
      },
      localDir: req.body.localDir,
      remoteDir: req.body.remoteDir,
      downloadRemoteDir: req.body.downloadRemoteDir,
      deleteAfterUpload: req.body.deleteAfterUpload === 'on',
      deleteAfterDownload: req.body.deleteAfterDownload === 'on',
      downloadDir: req.body.downloadDir,
      Observacions: req.body.Observacions
    };
    //writeConfig(newConnexio);
    writeConnexio(newConnexio);
    // res.send('<h2>Configuració desada correctament!</h2><a href="/">Torna enrere</a>');
    const msg = `<h2>Connexió desada correctament!</h2>
    <br>
    <hr>Dades connexió:</hr>
    <br>
    <p>Nom del servidor: <b>${newConnexio.ftp.host}</b></p>
    <p>Port de connexió: <b>${newConnexio.ftp.port}</b></p>
    <p>Nom usuri: <b>${newConnexio.ftp.user}</b></p>
    <p>Contrasenya: <b>***</b></p>
    <p>Connexió segura: <b>${req.body['ftp.user']}</b></p>
    <br>
    <hr>Directoris:</hr>
    <p>Directori local fixers per pujar: <b>${newConnexio.localDir}</b></p>
    <p>Directori remot fixers per deixar: <b>${newConnexio.remoteDir}</b></p>
    
    `
    res.send(webMissatge(msg))
  });

  // Inici del servidor
  server = app.listen(port, () => {
    console.log(`Servidor en funcionament a http://localhost:${port}`);
    console.log(`IP de xarxa d'aquest ordinador: ${getLocalIP()}`);
    //console.log(`IP publica de la xarxa: ${getPublicIp()}`);
    // getPublicIp(false)
    if ( autoOpen ) {
      if ( autoClose ) {
        console.log(`Atenció!, no tanqueu aquesta finestra, es tancarà quan feu exit a la web`);
      }
      open(`http://localhost:${port}`);
    }
  });

};

// Iniciar el servidor
startServer();
