const BACKEND_CAIDO = 'El backend no responde. Verifica que esté iniciado.';

export async function pedirJSON(ruta, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(`/api${ruta}`, {
            ...opciones,
            headers: {
                'Content-Type': 'application/json',
                ...opciones.headers,
            },
        });
    } catch {
        throw new Error(BACKEND_CAIDO);
    }

    let datos = null;
    try {
        datos = await respuesta.json();
    } catch {
        datos = null;
    }

    if (!respuesta.ok) {
        if (datos && datos.error) throw new Error(datos.error);
        throw new Error(respuesta.status === 500 ? BACKEND_CAIDO : `El backend respondió ${respuesta.status}`);
    }

    return datos;
}
