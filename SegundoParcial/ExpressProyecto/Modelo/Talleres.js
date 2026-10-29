const pool = require('../db-local');

const COLUMNAS_PUBLICAS = 'id, nombre, descripcion, cupo, fecha_inicio, imparte';


async function listar() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM talleres ORDER BY id`);
    return filas;
}


async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM talleres WHERE id = ?`, [id]);
    return filas[0];
}


async function crear({nombre, descripcion, cupo, fecha_inicio, imparte}) {
    const [info] = await pool.query(
        `INSERT INTO talleres (nombre, descripcion, cupo, fecha_inicio, imparte) VALUES (?, ?, ?, ?, ?)`,
        [nombre, descripcion || null, cupo, fecha_inicio || null, imparte || null]
    );
    return obtenerPorId(info.insertId);
}


async function actualizar(id, {nombre, descripcion, cupo, fecha_inicio, imparte}) {
    const cambios = Object.entries({nombre, descripcion, cupo, fecha_inicio, imparte}).filter(([, valor]) => valor !== undefined);
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

async function listarPorUsuario(usuarioId) {
    const [filas] = await pool.query(
        `SELECT t.id, t.nombre, t.descripcion, t.cupo, t.fecha_inicio, t.imparte
         FROM inscripciones i
         JOIN talleres t ON t.id = i.taller_id
         WHERE i.usuario_id = ?
         ORDER BY t.fecha_inicio DESC, t.nombre`,
        [usuarioId]
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

async function tieneInscripcion(usuarioId) {
    const [filas] = await pool.query(
        `SELECT id FROM inscripciones WHERE usuario_id = ? LIMIT 1`,
        [usuarioId]
    );
    return filas.length > 0;
}

async function contarInscritos(tallerId) {
    const [filas] = await pool.query(
        `SELECT COUNT(*) AS total FROM inscripciones WHERE taller_id = ?`,
        [tallerId]
    );
    return Number(filas[0].total);
}

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    inscribir,
    listarInscritos,
    listarPorUsuario,
    estaInscrito,
    tieneInscripcion,
    contarInscritos
};