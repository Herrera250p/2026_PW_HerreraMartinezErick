const pool = require('../db-local');

const COLUMNAS_PUBLICAS = 'id, nombre, descripcion, cupo';


async function listar() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM talleres ORDER BY id`);
    return filas;
}


async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM talleres WHERE id = ?`, [id]);
    return filas[0];
}


async function crear({nombre, descripcion, cupo}) {
    const [info] = await pool.query(
        `INSERT INTO talleres (nombre, descripcion, cupo) VALUES (?, ?, ?)`,
        [nombre, descripcion || null, cupo]
    );
    return obtenerPorId(info.insertId);
}


async function actualizar(id, {nombre, descripcion, cupo}) {
    const cambios = Object.entries({nombre, descripcion, cupo}).filter(([, valor]) => valor !== undefined);
    if (cambios.length === 0) return obtenerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(', ');

    const [info] = await pool.query(
        `UPDATE talleres SET ${columnas} WHERE id = ?`,
        [...cambios.map(([, valor]) => valor), id]
    );

    if (info.affectedRows === 0) return undefined;
    return obtenerPorId(id);
}


async function eliminar(id) {
    const [info] = await pool.query(`DELETE FROM talleres WHERE id = ?`, [id]);
    return info.affectedRows > 0;
}


//inscribir a un usuario en un taller
async function inscribir(usuarioId, tallerId) {
    const [info] = await pool.query(
        `INSERT INTO inscripciones (usuario_id, taller_id) VALUES (?, ?)`,
        [usuarioId, tallerId]
    );
    const [filas] = await pool.query(
        `SELECT id, usuario_id, taller_id, fecha_registro FROM inscripciones WHERE id = ?`,
        [info.insertId]
    );
    return filas[0];
}


//consultar los alumnos inscritos en un taller
async function listarInscritos(tallerId) {
    const [filas] = await pool.query(
        `SELECT u.id, u.nombre, u.correo, u.boleta, i.fecha_registro
         FROM inscripciones i
         JOIN usuarios u ON u.id = i.usuario_id
         WHERE i.taller_id = ?
         ORDER BY u.nombre`,
        [tallerId]
    );
    return filas;
}
async function estaInscrito(usuarioId, tallerId) {
    const [filas] = await pool.query(
        `SELECT id FROM inscripciones WHERE usuario_id = ? AND taller_id = ?`,
        [usuarioId, tallerId]
    );
    return filas.length > 0;
}


module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    inscribir,
    listarInscritos,
    estaInscrito
};