import { useEffect, useState } from 'react';
import TarjetaTaller from '../../components/TarjetaTaller';
import { pedirJSON } from '../../lib/api';
import estilos from '../../styles/Talleres.module.css';

export default function Talleres() {
    const [talleres, setTalleres] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cupo, setCupo] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [imparte, setImparte] = useState('');
    const [errorFormulario, setErrorFormulario] = useState('');
    const [exito, setExito] = useState('');
    const [creando, setCreando] = useState(false);

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

    async function crearTaller(evento) {
        evento.preventDefault();
        setErrorFormulario('');
        setExito('');
        setCreando(true);

        try {
            const nuevoTaller = await pedirJSON('/talleres', {
                method: 'POST',
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim(),
                    cupo: Number(cupo),
                    fecha_inicio: fechaInicio,
                    imparte: imparte.trim(),
                }),
            });
            setTalleres((actuales) => [...actuales, nuevoTaller]);
            setNombre('');
            setDescripcion('');
            setCupo('');
            setFechaInicio('');
            setImparte('');
            setExito('El taller se creó correctamente.');
        } catch (err) {
            setErrorFormulario(err.message);
        } finally {
            setCreando(false);
        }
    }

    const texto = busqueda.trim().toLowerCase();
    const visibles = talleres.filter((taller) =>
        `${taller.nombre || ''} ${taller.descripcion || ''}`.toLowerCase().includes(texto)
    );

    return (
        <main>
            <h1>Talleres</h1>
            <section className={estilos.panel}>
                <h2>Crear taller</h2>
                <form onSubmit={crearTaller} className="formulario">
                    <label>
                        Nombre
                        <input
                            value={nombre}
                            onChange={(evento) => setNombre(evento.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Descripción
                        <textarea
                            value={descripcion}
                            onChange={(evento) => setDescripcion(evento.target.value)}
                            rows="3"
                        />
                    </label>
                    <label>
                        Cupo
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={cupo}
                            onChange={(evento) => setCupo(evento.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Fecha de inicio
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(evento) => setFechaInicio(evento.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Instructor
                        <input
                            value={imparte}
                            onChange={(evento) => setImparte(evento.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" disabled={creando}>
                        {creando ? 'Creando…' : 'Crear taller'}
                    </button>
                </form>
                {errorFormulario && <p className="error">{errorFormulario}</p>}
                {exito && <p className={estilos.exito}>{exito}</p>}
            </section>
            <input
                className={estilos.buscador}
                placeholder="Buscar por nombre o descripción"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
            />
            {cargando && <p>Cargando talleres…</p>}
            {error && <p className="error">{error}</p>}
            {!cargando && !error && visibles.length === 0 && (
                <p>{talleres.length === 0 ? 'No hay talleres registrados.' : 'No se encontraron talleres.'}</p>
            )}
            {!cargando && !error && visibles.length > 0 && (
                <div className={estilos.rejilla}>
                    {visibles.map((taller) => (
                        <TarjetaTaller key={taller.id} taller={taller} />
                    ))}
                </div>
            )}
        </main>
    );
}
