import Link from 'next/link'

export default function Menu(){
    return (
        <nav>
            <Link href="/" >Inicio</Link>
            <Link href="/talleres" >Talleres</Link>
            <Link href="/asistencia" >Asistencia</Link>
            <Link href="/usuarios" >Usuarios</Link>
            <Link href="/perfil" >Mi perfil</Link>
        </nav>
    );
}