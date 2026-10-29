import { useState } from 'react';
import Link from 'next/link';
import { pedirJSON } from '../lib/api';
import { validarBoleta } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

export default function Perfil() {
    const [boleta, setBoleta] = useState('');
    const [buscada, setBuscada] = useState('');
    const [alumno, setAlumno] = useState(null);
    const [misTalleres, setMisTalleres] = useState([]);
    const [disponibles, setDisponibles] = useState([]);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function buscar(evento) {
        evento.preventDefault();
        setError('');
        setBuscada('');
        const boletaLimpia = boleta.trim();
        if (!validarBoleta(boletaLimpia)) {
            setError('La boleta debe tener 10 dígitos.');
            return;
        }

        setCargando(true);
        try {
            const [usuarios, talleres] = await Promise.all([
                pedirJSON('/usuarios'),
                pedirJSON('/talleres'),
            ]);
            if (!Array.isArray(usuarios) || !Array.isArray(talleres)) {
                throw new Error('El backend devolvió datos de perfil no válidos.');
            }

            const listas = await Promise.all(
                talleres.map((taller) => pedirJSON(`/talleres/${taller.id}/inscritos`))
            );
            if (!listas.every(Array.isArray)) {
                throw new Error('El backend devolvió una lista de inscritos no válida.');
            }

            const conInscritos = talleres.map((taller, indice) => ({
                ...taller,
                inscritos: listas[indice],
            }));
            const mios = conInscritos.filter((taller) =>
                taller.inscritos.some((inscrito) => inscrito.boleta === boletaLimpia)
            );
            const idsMios = new Set(mios.map((taller) => taller.id));
            const conLugar = conInscritos.filter(
                (taller) => !idsMios.has(taller.id) && taller.inscritos.length < taller.cupo
            );

            setAlumno(usuarios.find((usuario) => usuario.boleta === boletaLimpia) || null);
            setMisTalleres(mios);
            setDisponibles(conLugar);
            setBuscada(boletaLimpia);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <main>
            <h1>Mi perfil</h1>
            <form onSubmit={buscar} className="formulario">
                <input
                    placeholder="Tu boleta (10 dígitos)"
                    value={boleta}
                    onChange={(evento) => setBoleta(evento.target.value)}
                />
                <button type="submit" disabled={cargando}>
                    {cargando ? 'Buscando…' : 'Ver mi perfil'}
                </button>
            </form>
            {error && <p className="error">{error}</p>}
            {buscada && (
                <>
                    <section className={estilos.panel}>
                        {alumno ? (
                            <>
                                <h2>{alumno.nombre}</h2>
                                <p><strong>Correo:</strong> {alumno.correo}</p>
                                <p><strong>Boleta:</strong> {alumno.boleta}</p>
                                <p><strong>Rol:</strong> {alumno.rol}</p>
                            </>
                        ) : (
                            <p>La boleta {buscada} no tiene una cuenta registrada.</p>
                        )}
                    </section>
                    <h2>Mis talleres ({misTalleres.length})</h2>
                    {misTalleres.length === 0 ? (
                        <p>Todavía no estás inscrito en ningún taller.</p>
                    ) : (
                        <ul className={estilos.lista}>
                            {misTalleres.map((taller) => (
                                <li key={taller.id}>
                                    <Link href={`/talleres/${taller.id}`}>{taller.nombre}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    <h2>Talleres con lugar disponible</h2>
                    {disponibles.length === 0 ? (
                        <p>No hay más talleres con lugar.</p>
                    ) : (
                        <ul className={estilos.lista}>
                            {disponibles.map((taller) => {
                                const lugares = taller.cupo - taller.inscritos.length;
                                const nombre = alumno ? alumno.nombre : '';
                                const href = `/talleres/${taller.id}?boleta=${buscada}&nombre=${encodeURIComponent(nombre)}`;
                                return (
                                    <li key={taller.id}>
                                        <Link href={href}>{taller.nombre}</Link>
                                        {' — '}{lugares} {lugares === 1 ? 'lugar' : 'lugares'} · Inscribirme
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            )}
        </main>
    );
}
