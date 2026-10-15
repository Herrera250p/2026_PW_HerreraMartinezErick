const bcrypt = require('bcryptjs');

const usuariosModel = require('../Modelo/usuarios');

const {validarCorreo, validarBoleta, validarContraseña} = require('../validaciones');

//que pasa si el correo y boleta se duplica

function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

async function listarUsuario(req, res) {
    try{
        const usuarios = await ususariosModel.listar();
        req.json(usuarios);
    }catch(error){
        res.status(500).json({error: error.mesaje})
    }    
}