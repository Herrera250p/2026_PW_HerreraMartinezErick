const express = require('express')

const app = express();

app.use(express.json());


const PORT = 4000;


//tenemos la ruta principal por medio del metodo get

app.get('/saludo', (req, res) => {
    res.json({mensaje: 'Hola esto es una prueba en GET'})
})

//rutas por medio del metodo post , como un 

app.post('/eco', (req, res)=> {
    const {texto} = req.body;
    if(!texto){
        ret
    }
})