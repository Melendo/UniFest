"use strict";

//Requires
const express = require('express');
const path = require('path');
const db = require('./dataBase/db');

//Definimos el servidor y el puerto
const app = express();
const port = 3000;

//Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));

//Maneja peticion get al root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () =>{
    console.log('Servidor escuchando en http://localhost:' + port);
});