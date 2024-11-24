"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/', async (req, res) => {
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    const nombre = req.session.nombre;
    console.log("holalaaa")
    try{
        console.log("holalaaa")
        //Consulta eventos proximos
        const queryProximos = 'SELECT * FROM eventos WHERE fecha > NOW() ORDER BY fecha ASC LIMIT 5';
        const resProximos = await db.query(queryProximos);
        
        resProximos.forEach(evento =>{
            evento.fecha = db.formatearFecha(evento.fecha);
        });

        console.log("holalaaa")
        console.log(resProximos);
        
        res.render('home', { rol: req.session.rol, nombre, proximos : resProximos });
    }catch(error){
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
        
    }
    
    
    
});

module.exports = router;