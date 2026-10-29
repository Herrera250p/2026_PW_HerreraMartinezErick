import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { pedirJSON } from '../../lib/api';
import { validarBoleta } from '../../lib/validaciones';
import { ocultarBoleta } from '../../lib/formato';
import estilos from '../../styles/Talleres.module.css';

export default function DetalleTaller() {
    const router = useRouter();
    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    const [taller, setTaller] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [boleta, setBoleta] = useState('');
    const [errorForm, setErrorForm] = useState('');
    const [exito, setExito] = useState('');
    const [enviando, setEnviando] = useState(false);

    async function cargar() {
        setCargando(true);
        try {
            const [datosTaller, datosInscritos] = await Promise.all([
                pedirJSON(`/talleres/${id}`),
                pedirJSON(`/talleres/${id}/inscritos`),
            ]);
            if (!Array.isArray(datosInscritos)) throw new Error('El backend devolvió una lista de inscritos no válida.');
            setTaller(datosTaller);
            setInscritos(datosInscritos);
            setErrorCarga('');
        } catch (err) {
            setErrorCarga(err.message);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        if (!router.isReady || !id) return;
        if (typeof router.query.boleta === 'string') setBoleta(router.query.boleta);
        cargar();
    }, [router.isReady, id]);

    async function inscribir(evento) {
        evento.preventDefault();
        setErrorForm('');
        setExito('');
        const boletaLimpia = boleta.trim();

        if (!validarBoleta(boletaLimpia)) {
            setErrorForm('La boleta debe tener 10 dígitos.');
            return;
        }

        if (inscritos.some((inscrito) => inscrito.boleta === boletaLimpia)) {
            setErrorForm('Esa boleta ya está inscrita en este taller.');
            return;
        }

        if (inscritos.length >= taller.cupo) {
            setErrorForm('El taller ya no tiene lugares.');
            return;
        }

        setEnviando(true);
        try {
            const usuarios = await pedirJSON('/usuarios');
            if (!Array.isArray(usuarios)) throw new Error('El backend devolvió una lista de usuarios no válida.');
            const usuario = usuarios.find((item) => item.boleta === boletaLimpia);
            if (!usuario) {
                throw new Error('No existe una cuenta registrada con esa boleta. Regístrate primero.');
            }

            await pedirJSON(`/talleres/${id}/inscripciones`, {
                method: 'POST',
                body: JSON.stringify({ usuarioId: usuario.id }),
            });
            setExito(`¡Listo! ${usuario.nombre} quedó inscrito(a) en el taller.`);
            setBoleta('');
            await cargar();
        } catch (err) {
            setErrorForm(err.message);
        } finally {
            setEnviando(false);
        }
    }

    if (errorCarga) {
        return (
            <main>
                <p className="error">{errorCarga}</p>
                <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
            </main>
        );
    }

    if (cargando || !taller) return <main><p>Cargando taller…</p></main>;

    const ocupados = inscritos.length;
    const libres = Math.max(0, taller.cupo - ocupados);
    const lleno = libres === 0;
    const porcentaje = taller.cupo > 0 ? Math.min(100, (ocupados / taller.cupo) * 100) : 0;

    return (
        <main>
            <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
            <h1>{taller.nombre}</h1>
            {taller.descripcion && <p>{taller.descripcion}</p>}
            <section className={estilos.panel}>
                <p><strong>Cupo:</strong> {taller.cupo} lugares</p>
                <div className={estilos.barra} aria-label={`${porcentaje}% del cupo ocupado`}>
                    <div className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
                </div>
                <p>
                    {ocupados} de {taller.cupo} lugares ocupados ·{' '}
                    {lleno
                        ? <span className={estilos.lleno}>Taller lleno</span>
                        : `${libres} ${libres === 1 ? 'lugar libre' : 'lugares libres'}`}
                </p>
            </section>

            <section className={estilos.panel}>
                <h2>Inscribirme</h2>
                <form onSubmit={inscribir} className="formulario">
                    <input
                        placeholder="Boleta (10 dígitos)"
                        value={boleta}
                        onChange={(evento) => setBoleta(evento.target.value)}
                    />
                    <button type="submit" disabled={lleno || enviando}>
                        {lleno ? 'Sin lugares' : enviando ? 'Inscribiendo…' : 'Inscribirme'}
                    </button>
                </form>
                {errorForm && <p className="error">{errorForm}</p>}
                {exito && <p className={estilos.exito}>{exito}</p>}
            </section>

            <h2>Inscritos ({ocupados})</h2>
            {ocupados === 0 ? (
                <p>Todavía no hay inscritos. ¡Sé el primero!</p>
            ) : (
                <table className={estilos.tabla}>
                    <thead>
                        <tr><th>#</th><th>Nombre</th><th>Boleta</th></tr>
                    </thead>
                    <tbody>
                        {inscritos.map((inscrito, indice) => (
                            <tr key={inscrito.id}>
                                <td>{indice + 1}</td>
                                <td>{inscrito.nombre}</td>
                                <td>{ocultarBoleta(inscrito.boleta)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
