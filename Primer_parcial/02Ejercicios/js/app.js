

const talleres = [
    { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
    { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
    { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
    { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];



const tbody = document.querySelector('#tabla-talleres tbody');
function pintarTabla(){
    //debe de obtener la tabla y rellenarla con los datos de talleres

    const filasHTML = talleres.map((t) =>{
        return `
            <tr>
                <td>${t.nombre}</td>
                <td>${t.instructor}</td>
                <td>${t.cupo}</td>
                <td>${t.inscritos}</td>
            </tr>
            `;
    }).join('');
    tbody.innerHTML = filasHTML;

} 

pintarTabla();

const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (evento) =>{
    evento.preventDefault();
    const operacion = selectOperacionArreglo.value;

    let resultado;

    switch(operacion){
        case 'forEach':
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;
        case 'map' :
            const nombres =talleres.map((t) => t.nombre);
            resultado = nombres.map((nombre) => `- ${nombre}`).join('\n');
            break;
        case 'filter': 
            const llenos = talleres.filter((t) => t.inscritos >= t.cupo);
            resultado = llenos.map((t) => `- ${t.nombre}`).join('\n');
            break;
        case 'find' :
            const primerTallerMaria =talleres.find((t) => t.instructor === "Ing. María López");
            resultado = primerTallerMaria ? `- ${primerTallerMaria.nombre} (${primerTallerMaria.inscritos}/${primerTallerMaria.cupo})`:'No se necontro el taller';
            break;
        case 'reduce':    
            const totalinscritos = talleres.reduce((acum, t) => acum + t.inscritos, 0);
            resultado = `Total inscritos: ${totalinscritos}`;
            break;
        case 'filter + map':
            const talleresdisponibles = talleres
                .filter((t) => t.inscritos < t.cupo)
                .map((t) => t.nombre);
            resultado = talleresdisponibles.map((nombre) => `-${nombre}`).join('\n');
            break;

        default:
            resultado = '';

    }


    resultadoArreglos.textContent = resultado;
});


//ejerciio de objetos

const formObjeto = document.getElementById('form-objeto');
const resultadoObjeto = document.getElementById('resultado-objeto');


formObjeto.addEventListener('submit', (evento) => {
    evento.preventDefault();

    //necesitamos construit el objeto taller
    const taller = {
        nombre: document.getElementById('obj-nombre').value,
        instructor: document.getElementById('obj-instructor').value,
        cupo : Number(document.getElementById('obj-cupo').value),
        inscritos: Number(document.getElementById('obj-inscritos').value)
    };

    const operacion = document.getElementById('operacion-objeto').value;

    let resultado;
    switch(operacion){
        case 'keys':
            resultado = JSON.stringify(Object.keys(taller));
            break;
        case 'values' :
            break;
        case 'entries':
            break;
        case 'stringify':
            const textoJson = JSON.stringify(taller, null, 2);
            resultado = `${textoJson}\n \n tipo: ${typeof textoJson}`;
            break;
        case 'roundtrip':
            break;
    }
    resultadoObjeto.textContent  = resultado;
});