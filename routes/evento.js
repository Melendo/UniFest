"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/x', function(req, res) {
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    
    // Comprobar el rol y renderizar la vista correspondiente
    
    res.render('evento', { rol: req.session.rol });
    
    
});

module.exports = router;