//necesitamos a los modelos
const asistenciaModel = require('../Modelo/asistencia');
const talleresModel = require('../Modelo/Talleres');
const usuariosModel = require('../Modelo/usuarios');

//que pasa si la asistencia del dia se duplica
function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

function idValido(valor){
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0;
}

//formato YYYY-MM-DD y que la fecha exista (rechaza 2026-02-31)
function fechaValida(fecha){
    if(typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const date = new Date(`${fecha}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === fecha;
}

//registrar asistencia en el taller
async function registrarAsistencia(req, res) {
    const {usuarioId, tallerId, fecha} = req.body;

    if(!idValido(usuarioId) || !idValido(tallerId)){
        return res.status(400).json({error: 'Usuarios y taller son obligatorios y deben ser validos'});
    }
    if(fecha !== undefined && !fechaValida(fecha)){
        return res.status(400).json({error: 'La fecha debe tener el formato AAAA-MM-DD'});
    }

    try{
        const taller = await talleresModel.obtenerPorId(tallerId);
        if(!taller) return res.status(404).json({error: 'Taller no encontrado'});

        const usuario = await usuariosModel.obtenerPorId(usuarioId);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});

        //solo puede asistir quien esta inscrito en el taller
        if(!(await talleresModel.estaInscrito(usuarioId, tallerId))){
            return res.status(400).json({error: 'El usuario no esta inscrito en este taller'});
        }

        const asistencia = await asistenciaModel.registrar({usuarioId, tallerId, fecha});
        res.status(201).json(asistencia);
    }catch(error){
        if(esDuplicado(error)) return res.status(409).json({error: 'La asistencia ya fue registrada'});
        res.status(500).json({error: error.message});
    }
}


async function listarAsistenciaTaller(req, res) {
    const {fecha} = req.query;

    if(!idValido(req.params.id)) return res.status(400).json({error: 'El id del taller no es valido'});
    if(fecha !== undefined && !fechaValida(fecha)){
        return res.status(400).json({error: 'La fecha debe tener el formato AAAA-MM-DD'});
    }

    try{
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if(!taller) return res.status(404).json({error: 'Taller no encontrado'});

        const lista = await asistenciaModel.listarPorTaller(req.params.id, fecha);
        res.json(lista);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

//consultar las asistencias de un alumno
async function listarAsistenciaUsuario(req, res) {
    if(!idValido(req.params.id)) return res.status(400).json({error: 'El id del usuario no es valido'});

    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});

        const lista = await asistenciaModel.listarPorUsuario(req.params.id);
        res.json(lista);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

module.exports = {registrarAsistencia, listarAsistenciaTaller, listarAsistenciaUsuario};