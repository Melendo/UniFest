"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/:id', async(req, res) =>{
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }
    
    const idEvento = req.params.id;
    console.log(idEvento)
    
    try{
        
        //Consulta evento
        
        const queryEvento = 'SELECT * FROM eventos WHERE ID = ?';
        
        const [resEvento] = await db.query(queryEvento, idEvento);
        
        if (!resEvento) {
            return res.status(400).json({ message: 'Evento no encontrado.' });
        }
        
        console.log(resEvento);
        
        resEvento.fecha = db.formatearFecha(resEvento.fecha);
        res.render('evento', { rol: req.session.rol, evento: resEvento });
    }
    catch(error){
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
    }
});


module.exports = router;