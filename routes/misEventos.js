"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

router.get('/', async(req, res)  => {
    res.status(404, {message: "page not found"});
});

router.get('/misEventos', async(req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    res.render('misEventos', { rol: req.session.rol });

});

router.get('/misInscripciones', async(req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    res.render('misInscripciones', { rol: req.session.rol });

});

module.exports = router;