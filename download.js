
import { downloadFiles, listDownloadFiles } from './moduls/download-modul.js'
import { downloadFilesCmd } from './moduls/download-modul-cmd.js'
import { webMissatge, webBaixar } from './moduls/web-moduls.js'
import { getWriteMessageProces, iniWriteMessageProces } from './moduls/utilitats-modul.js'

function resultatCallbackDownList(error, result, req, res) {
    let msg = ''
    if (error) {
        //console.error('S\'ha produït un error:', error);
        msg = "S'ha produït un error: "+ error
        res.send(webMissatge(msg + getWriteMessageProces()))
    } else {
        // console.log('Operació completada amb èxit.');
        // if (result) {
        //     console.log('Fitxers processats:', result);
        // }
        res.send(webBaixar(result))
    }
}

function resultatCallbackDown(error, result, req, res) {
    let msg = ''
    if (error) {
        msg = "S'ha produït un error: "+ error
    } else {

        msg = '<h2>Fixers rebuts correctament!</h2>'
    }
    res.send(webMissatge(msg + getWriteMessageProces()))
}

async function llistatFitxersBaixada( verbose = false, req, res) {
    return await listDownloadFiles(false, resultatCallbackDownList, req, res)
}


function baixarFitxers( verbose = false, req, res ) {
    // Executar la funció de descàrrega
    const args = process.argv.slice( 2 );
    if ( args.includes( '--list' ) ) {
        downloadFiles( true, verbose, false, resultatCallbackDown, req, res  );
    } else {
        downloadFiles( false, verbose, true, resultatCallbackDown, req, res  );
    }
}
function baixarFitxersCmd( verbose = false ) {
    // Executar la funció de descàrrega
    const args = process.argv.slice( 2 );
    if ( args.includes( '--list' ) ) {
        downloadFilesCmd( true, verbose );
    } else {
        downloadFilesCmd( false, verbose, true, );
    }
}

export {
    baixarFitxers,
    baixarFitxersCmd,
    llistatFitxersBaixada,
}