//vamos a ateneer funcioness que se encargan de validar correo, bnoleta y contraseña

//wiiii mas tarea siiiiiiii

//aqui va funvion correo
 //boleta
function validarBoleta(contraseña){

}

function validarCorreo(contraseña){

}

function validarContraseña(contraseña){
    if(typeof contraseña !== 'string')return false;
    return contraseña.length >= 8;
}

module.exports = {validarCorreo, validarContraseña, validarBoleta};