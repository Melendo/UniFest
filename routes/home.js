"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

     // Verificar si el usuario está autenticado
     if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    const nombre = req.session.nombre

    // Comprobar el rol y renderizar la vista correspondiente
    if (req.session.rol === 0) {
        res.render('home', { rol: "usuario", nombre });
    } else if (req.session.rol === 1) {
        res.render('home', { rol: "organizador", nombre});
    } else {
        res.status(403).send('Acceso denegado: rol no reconocido');
    }
    
});

module.exports = router;