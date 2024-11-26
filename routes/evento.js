"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/evento/:id', async(req, res) =>{
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
        return res.redirect('/login');
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

        var capActual;

        if(resEvento.capcidad_máxima <= resEvento.pos_cola){
            capActual = resEvento.capcidad_máxima;
        }
        else{
            capActual = resEvento.pos_cola;
        }
        
        resEvento.fecha = db.formatearFecha(resEvento.fecha);

        const queryFacultadEvento = 'SELECT * FROM facultades WHERE ID = ?';
        const [resFacultad] = await db.query(queryFacultadEvento, resEvento.ID_facultad); 

        res.render('evento', { rol: req.session.rol, evento: resEvento, facultad: resFacultad, id: req.session.userId, capActual});
    }
    catch(error){
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
    }
});

router.post('/inscribirse/:id', async (req, res) => {
    const userId = req.session.userId;
    const eventId = req.params.id;

    if (!userId) {
        return res.redirect('/login');
    }

    try {
        // Verificar si el evento existe y está activo
        const queryEvento = 'SELECT activo, capacidad_máxima, pos_cola FROM eventos WHERE ID = ?';
        const [evento] = await db.query(queryEvento, [eventId]);

        if (!evento || evento.activo !== 1) {
            return res.status(400).json({ message: 'El evento no está disponible para inscripciones.' });
        }

        // Verificar si el usuario ya está inscrito o en cola
        const queryInscripcionExistente = `
            SELECT * FROM inscripciones WHERE ID_usuario = ? AND ID_evento = ?`;
        const [inscripcionExistente] = await db.query(queryInscripcionExistente, [userId, eventId]);

        if (inscripcionExistente) {
            return res.status(400).json({ message: 'Ya estás inscrito o en la cola para este evento.' });
        }

        // Determinar el estado del usuario (inscrito o en espera)
        const plazasOcupadas = evento.pos_cola;
        let nuevoEstado = 'en_espera';
        let nuevaPosicion = plazasOcupadas + 1; // Incrementar la posición de la cola

        if (plazasOcupadas < evento.capacidad_máxima) {
            nuevoEstado = 'inscrito'; // Hay plazas disponibles
        }

        // Insertar la inscripción del usuario
        const queryInscribir = `
            INSERT INTO inscripciones (ID_usuario, ID_evento, estado, pos)
            VALUES (?, ?, ?, ?)`;
        await db.query(queryInscribir, [userId, eventId, nuevoEstado, nuevaPosicion]);

        // Actualizar la posición de la cola en la tabla eventos
        const queryActualizarCola = `
            UPDATE eventos SET pos_cola = ? WHERE ID = ?`;
        await db.query(queryActualizarCola, [nuevaPosicion, eventId]);

        //Mensaje de éxito
        return res.status(200).json({ message:'¡Inscripción completada con éxito!'});
    } 
    catch (error) {
        console.error('Error al inscribirse al evento:', error);
        return res.status(500).json({ message: 'Ocurrió un error al procesar tu inscripción.' });
    }
});



module.exports = router;