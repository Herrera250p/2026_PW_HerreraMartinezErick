//vamos a ateneer funcioness que se encargan de validar correo, bnoleta y contraseña

//wiiii mas tarea siiiiiiii

//aqui va funvion correo
 //boleta
function validarBoleta(boleta){
    if(typeof boleta !== 'string') return false;
    return /^\d{10}$/.test(boleta);
}

function validarCorreo(correo){
    if(typeof correo !== 'string') return false;
    if(correo.length > 150) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarContraseña(contraseña){
    if(typeof contraseña !== 'string')return false;
    return contraseña.length >= 8;
}

function validarNombre(nombre){
    if(typeof nombre !== 'string') return false;
    const nombreLimpio = nombre.trim();
    if(nombreLimpio.length === 0) return false;
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombreLimpio);
}

module.exports = {validarCorreo, validarContraseña, validarBoleta, validarNombre};