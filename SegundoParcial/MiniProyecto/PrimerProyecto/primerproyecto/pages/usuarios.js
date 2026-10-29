import { useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';
import { ocultarBoleta } from '../lib/formato';
import estilos from '../styles/Talleres.module.css';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [boleta, setBoleta] = useState('');
    const [errorFormulario, setErrorFormulario] = useState('');
    const [exito, setExito] = useState('');
    const [creando, setCreando] = useState(false);

    useEffect(() => {
        async function cargarUsuarios() {
            try {
                const datos = await pedirJSON('/usuarios');
                if (!Array.isArray(datos)) throw new Error('El backend devolvió una lista de usuarios no válida.');
                setUsuarios(datos);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }

        cargarUsuarios();
    }, []);

    async function crearUsuario(evento) {
        evento.preventDefault();
        setErrorFormulario('');
        setExito('');
        setCreando(true);

        try {
            const nuevoUsuario = await pedirJSON('/usuarios', {
                method: 'POST',
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    correo: correo.trim(),
                    contrasena,
                    boleta: boleta.trim(),
                    rol: 'alumno',
                }),
            });
            setUsuarios((actuales) => [...actuales, nuevoUsuario]);
            setNombre('');
            setCorreo('');
            setContrasena('');
            setBoleta('');
            setExito('El usuario se creó correctamente.');
        } catch (err) {
            setErrorFormulario(err.message);
        } finally {
            setCreando(false);
        }
    }

    return (
        <main>
            <h1>Usuarios</h1>
            <section className={estilos.panel}>
                <h2>Crear usuario</h2>
                <form onSubmit={crearUsuario} className="formulario">
                    <label>
                        Nombre
                        <input
                            value={nombre}
                            onChange={(evento) => setNombre(evento.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Correo
                        <input
                            type="email"
                            value={correo}
                            onChange={(evento) => setCorreo(evento.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Contraseña (mínimo 8 caracteres)
                        <input
                            type="password"
                            minLength="8"
                            value={contrasena}
                            onChange={(evento) => setContrasena(evento.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Boleta (10 dígitos)
                        <input
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength="10"
                            value={boleta}
                            onChange={(evento) => setBoleta(evento.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" disabled={creando}>
                        {creando ? 'Creando…' : 'Crear usuario'}
                    </button>
                </form>
                {errorFormulario && <p className="error">{errorFormulario}</p>}
            </section>
            {cargando && <p>Cargando usuarios…</p>}
            {error && <p className="error">{error}</p>}
            {exito && <p className={estilos.exito}>{exito}</p>}
            {!cargando && !error && usuarios.length === 0 && <p>No hay usuarios registrados.</p>}
            {!cargando && !error && usuarios.length > 0 && (
                <table className={estilos.tabla}>
                    <thead>
                        <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Boleta</th><th>Rol</th></tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.correo}</td>
                                <td>{ocultarBoleta(usuario.boleta)}</td>
                                <td>{usuario.rol}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
