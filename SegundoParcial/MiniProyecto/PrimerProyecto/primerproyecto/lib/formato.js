export function ocultarBoleta(boleta) {
    if (typeof boleta !== 'string' || !/^\d{10}$/.test(boleta)) {
        return 'Boleta no disponible';
    }

    return boleta.replace(/\d(?=\d{4})/g, '*');
}
