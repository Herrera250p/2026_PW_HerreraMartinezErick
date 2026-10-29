import Link from 'next/link';
import estilos from '../styles/Talleres.module.css';

export default function TarjetaTaller({ taller }) {
    return (
        <article className={estilos.tarjeta}>
            <h2>{taller.nombre}</h2>
            <p>{taller.descripcion || 'Sin descripción disponible.'}</p>
            <p><strong>Cupo:</strong> {taller.cupo} lugares</p>
            <Link className={estilos.enlace} href={`/talleres/${taller.id}`}>
                Ver detalle e inscribirme →
            </Link>
        </article>
    );
}
