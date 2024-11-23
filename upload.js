import { uploadFiles } from './moduls/upload-modul.js'
import { uploadFilesCmd } from './moduls/upload-modul-cmd.js'
import { getWriteMessageProces, iniWriteMessageProces } from './moduls/utilitats-modul.js'
import { webMissatge } from './moduls/web-moduls.js'


function resultatCallback(error, result, req, res) {
    let msg = ''
    if (error) {
        msg = "S'ha produït un error: "+ error
    } else {

        msg = '<h2>Fixers enviat correctament!</h2>'
    }
    res.send(webMissatge(msg + getWriteMessageProces()))
}
//(verbose = false, actionWEB = false, listOnly = false, callback)

function pujarFitxers( verbose = alse,  actionWEB = false, req, res) {

    uploadFiles( verbose, actionWEB, false, resultatCallback, req, res);
}

function pujarFitxersCmd() {
    uploadFilesCmd();
}

// async function pujarFitxers( verbose = alse,  actionWEB = false) {
//     await uploadFiles( verbose, actionWEB );
// }

export {
    pujarFitxers,
    pujarFitxersCmd,

}