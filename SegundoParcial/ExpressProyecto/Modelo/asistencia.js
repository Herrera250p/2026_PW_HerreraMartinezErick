const pool = require('../db-local');


async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELECT id, usuario_id, taller_id, fecha FROM asistencias WHERE id = ?`,
        [id]
    );
    return filas[0];
}


async function registrar({usuarioId, tallerId, fecha}) {
    const [info] = await pool.query(
        `INSERT INTO asistencias (usuario_id, taller_id, fecha) VALUES (?, ?, COALESCE(?, CURDATE()))`,
        [usuarioId, tallerId, fecha || null]
    );
    return obtenerPorId(info.insertId);
}


async function listarPorTaller(tallerId, fecha) {
    const parametros = [tallerId];
    let filtroFecha = '';

    if (fecha) {
        filtroFecha = 'AND a.fecha = ?';
        parametros.push(fecha);
    }

    const [filas] = await pool.query(
        `SELECT a.id, a.fecha, u.id AS usuario_id, u.nombre, u.boleta
         FROM asistencias a
         JOIN usuarios u ON u.id = a.usuario_id
         WHERE a.taller_id = ? ${filtroFecha}
         ORDER BY a.fecha DESC, u.nombre`,
        parametros
    );
    return filas;
}


async function listarPorUsuario(usuarioId) {
    const [filas] = await pool.query(
        `SELECT a.id, a.fecha, t.id AS taller_id, t.nombre AS taller
         FROM asistencias a
         JOIN talleres t ON t.id = a.taller_id
         WHERE a.usuario_id = ?
         ORDER BY a.fecha DESC`,
        [usuarioId]
    );
    return filas;
}


module.exports = {obtenerPorId, registrar, listarPorTaller, listarPorUsuario};