"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

     // Verificar si el usuario está autenticado
     if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    const nombre = req.session.nombre;

    // Comprobar el rol y renderizar la vista correspondiente
        res.render('home', { rol: req.session.rol, nombre });
    
    
});

module.exports = router;