import { useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';
import { ocultarBoleta } from '../lib/formato';
import estilos from '../styles/Talleres.module.css';

function fechaLocal() {
    const ahora = new Date();
    const desplazamiento = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - desplazamiento).toISOString().slice(0, 10);
}

export default function Asistencia() {
    const [talleres, setTalleres] = useState([]);
    const [inscritos, setInscritos] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [tallerId, setTallerId] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [fecha, setFecha] = useState(fechaLocal);
    const [cargando, setCargando] = useState(true);
    const [cargandoInscritos, setCargandoInscritos] = useState(false);
    const [cargandoAsistencias, setCargandoAsistencias] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    useEffect(() => {
        async function cargarTalleres() {
            try {
                const datos = await pedirJSON('/talleres');
                if (!Array.isArray(datos)) throw new Error('El backend devolvió una lista de talleres no válida.');
                setTalleres(datos);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }

        cargarTalleres();
    }, []);

    useEffect(() => {
        setInscritos([]);
        setUsuarioId('');
        setAsistencias([]);
        if (!tallerId) return;

        let cancelado = false;
        async function cargarInscritos() {
            setCargandoInscritos(true);
            setError('');
            try {
                const datos = await pedirJSON(`/talleres/${tallerId}/inscritos`);
                if (!Array.isArray(datos)) throw new Error('El backend devolvió una lista de inscritos no válida.');
                if (!cancelado) setInscritos(datos);
            } catch (err) {
                if (!cancelado) setError(err.message);
            } finally {
                if (!cancelado) setCargandoInscritos(false);
            }
        }

        cargarInscritos();
        return () => {
            cancelado = true;
        };
    }, [tallerId]);

    useEffect(() => {
        if (!tallerId || !fecha) {
            setCargandoAsistencias(false);
            return;
        }

        let cancelado = false;
        async function cargarAsistencias() {
            setCargandoAsistencias(true);
            setError('');
            try {
                const datos = await pedirJSON(`/talleres/${tallerId}/asistencias?fecha=${fecha}`);
                if (!Array.isArray(datos)) throw new Error('El backend devolvió una lista de asistencias no válida.');
                if (!cancelado) setAsistencias(datos);
            } catch (err) {
                if (!cancelado) setError(err.message);
            } finally {
                if (!cancelado) setCargandoAsistencias(false);
            }
        }

        cargarAsistencias();
        return () => {
            cancelado = true;
        };
    }, [tallerId, fecha]);

    async function registrar(evento) {
        evento.preventDefault();
        setError('');
        setExito('');
        setEnviando(true);

        try {
            await pedirJSON('/asistencias', {
                method: 'POST',
                body: JSON.stringify({ tallerId: Number(tallerId), usuarioId: Number(usuarioId), fecha }),
            });
            setExito('La asistencia se registró correctamente.');
            const datos = await pedirJSON(`/talleres/${tallerId}/asistencias?fecha=${fecha}`);
            if (!Array.isArray(datos)) throw new Error('El backend devolvió una lista de asistencias no válida.');
            setAsistencias(datos);
            setUsuarioId('');
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main>
            <h1>Asistencia</h1>
            <section className={estilos.panel}>
                <h2>Registrar asistencia</h2>
                <form onSubmit={registrar} className="formulario">
                    <label>
                        Taller
                        <select value={tallerId} onChange={(evento) => setTallerId(evento.target.value)} required disabled={cargando}>
                            <option value="">{cargando ? 'Cargando talleres…' : 'Selecciona un taller'}</option>
                            {talleres.map((taller) => (
                                <option key={taller.id} value={taller.id}>{taller.nombre}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Usuario inscrito
                        <select
                            value={usuarioId}
                            onChange={(evento) => setUsuarioId(evento.target.value)}
                            disabled={!tallerId || cargandoInscritos || inscritos.length === 0}
                            required
                        >
                            <option value="">
                                {cargandoInscritos ? 'Cargando usuarios…' : 'Selecciona un usuario'}
                            </option>
                            {inscritos.map((usuario) => (
                                <option key={usuario.id} value={usuario.id}>
                                    {usuario.nombre} ({ocultarBoleta(usuario.boleta)})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Fecha
                        <input type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} required />
                    </label>
                    <button type="submit" disabled={!tallerId || !usuarioId || cargandoInscritos || enviando}>
                        {enviando ? 'Registrando…' : 'Registrar asistencia'}
                    </button>
                </form>
                {tallerId && !cargandoInscritos && inscritos.length === 0 && (
                    <p>No hay usuarios inscritos en este taller.</p>
                )}
                {error && <p className="error">{error}</p>}
                {exito && <p className={estilos.exito}>{exito}</p>}
            </section>

            <h2>Asistencias registradas</h2>
            {!tallerId ? (
                <p>Selecciona un taller para consultar sus asistencias.</p>
            ) : cargandoAsistencias ? (
                <p>Cargando asistencias…</p>
            ) : asistencias.length === 0 ? (
                <p>No hay asistencias registradas para esta fecha.</p>
            ) : (
                <table className={estilos.tabla}>
                    <thead>
                        <tr><th>Usuario</th><th>Boleta</th><th>Fecha</th></tr>
                    </thead>
                    <tbody>
                        {asistencias.map((asistencia) => (
                            <tr key={asistencia.id}>
                                <td>{asistencia.nombre}</td>
                                <td>{ocultarBoleta(asistencia.boleta)}</td>
                                <td>{String(asistencia.fecha).slice(0, 10)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
