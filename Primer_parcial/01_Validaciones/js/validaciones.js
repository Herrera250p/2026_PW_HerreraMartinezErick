/*
las validaciones de formuario son expreciones reguklares las cuales en este momento las podemos dividir en tres partes :
1.-para el texto (nombre)
2.- para el numerode boletA
3.- PARA LA FECHA 

Una exprecion regular es un patron donde se identifica que elementos seran valuidos vs
cuales no, son reglas mediante las culaes realixamos las validaciones de los datos 
itegrados por el usuario, en este caso, en un formulario
*/

const patrones = {
    nombre: /^ [A-Za-zÁÉÍÓáéíóúñüÜ\s{2,60}]$/,
    boleta :/^\d{10}$/,
    fecha :/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/ 
};


const mensajes = {
    nombre: "solo letras y espacios entre dos y 60 carateres",
    boleta : "Debe tener exactamente 10 dijitos",
    fecha : "Formato esperado : DD/MM/AAAA (ej. 01/01/2023)"
};

function validarCampo(campo, valor){

    return patrones[campo].test(valor.trim());

};

//necesitamos ver el resto del aechivo DOM,

if (typeof document !== 'undefined'){

    const formulario = document.getElementById('form-registro');

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();//para evitar que se envie auto
        let formularioValido = true;

        //tenemos que validar campo por campo

        for (const campo of Object.keys(patrones)){
            const input = document.getElementById(campo);
            const spanError =document.getElementById(`error-${campo}`);
            const esValido = validarCampo(campo, input.value);

            input.classList.toggle('invalido', !esValido);
            spanError.textContent = esValido ? '' : mensajes[campo];
            if(!esValido) formularioValido = false;


        }
    })
}