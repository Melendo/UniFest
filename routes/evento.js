"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');


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

/* GET home page. */
router.get('/:id', async(req, res) =>{
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    
    const idEvento = req.params.id;

    try{

        //Consulta evento

        const queryEvento = 'SELECT * FROM eventos WHERE ID = ?';

        const resEvento = await db.query(queryEvento, idEvento);

        if (!resEvento) {
            return res.status(400).json({ message: 'Evento no encontrado.' });
          }

          resEvento.fecha = db.formatearFecha(resEvento.fecha);
        res.render('evento', { rol: req.session.rol, evento: resEvento });
    }catch(error){
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
    }
    // Comprobar el rol y renderizar la vista correspondiente
    
    
    
});




module.exports = router;