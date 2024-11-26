"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/evento/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const idEvento = req.params.id;

    try {
        // Consulta del evento
        const queryEvento = 'SELECT * FROM eventos WHERE ID = ?';
        const [resEvento] = await db.query(queryEvento, idEvento);
        if (!resEvento) {
            return res.status(400).json({ message: 'Evento no encontrado.' });
        }

        // Obtenemos la capacidad actual
        const queryCapacidad = `
            SELECT COUNT(*) AS inscritos 
            FROM inscripciones 
            WHERE ID_evento = ? AND estado = 'inscrito'`;
        const [capacidad] = await db.query(queryCapacidad, [idEvento]);
        const capActual = capacidad.inscritos;

        // Formateamos la fecha
        resEvento.fecha = db.formatearFecha(resEvento.fecha);

        // Obtenemos la facultad
        const queryFacultadEvento = 'SELECT * FROM facultades WHERE ID = ?';
        const [resFacultad] = await db.query(queryFacultadEvento, resEvento.ID_facultad);

        // Verificar si el usuario está inscrito o en espera
        const queryInscripcion = `
            SELECT estado 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
        const [inscripcion] = await db.query(queryInscripcion, [req.session.userId, idEvento]);

        let inscrito = 'Inscríbete ya!';
        if (inscripcion?.estado === 'inscrito') {
            inscrito = 'Cancelar inscripción';
        } else if (inscripcion?.estado === 'en_espera') {
            inscrito = 'Cancelar espera';
        }

        res.render('evento', { 
            rol: req.session.rol, 
            evento: resEvento, 
            facultad: resFacultad, 
            id: req.session.userId, 
            capActual, 
            inscrito
        });
    } catch (error) {
        console.error('Error al cargar el evento:', error);
        return res.status(500).json({ message: 'Error al cargar el evento.' });
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

        // Verificar si el usuario ya está inscrito o en espera
        const queryInscripcion = `
            SELECT * 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
        const [inscripcion] = await db.query(queryInscripcion, [userId, eventId]);

        if (inscripcion) {
            return res.status(400).json({ message: 'Ya estás inscrito o en la cola para este evento.' });
        }

        // Determinar el estado del usuario (inscrito o en espera)
        const queryCapacidadActual = `
            SELECT COUNT(*) AS inscritos 
            FROM inscripciones 
            WHERE ID_evento = ? AND estado = 'inscrito'`;
        const [capacidad] = await db.query(queryCapacidadActual, [eventId]);

        const plazasOcupadas = capacidad.inscritos;
        const capacidadMaxima = evento.capacidad_máxima;

        let estado = 'en_espera';
        let posicion = evento.pos_cola + 1;
        let mensaje = 'El evento esta lleno pero te hemos puesto en la cola de espera';
        let titulo = 'En lista de espera';

        if (plazasOcupadas < capacidadMaxima) {
            estado = 'inscrito';
            posicion = 0; // Si hay espacio, se asigna posición 0
            mensaje = '¡Inscripción completada con éxito!';
            titulo = 'Felicidades!';
        }

        // Insertar inscripción
        const queryInscribir = `
            INSERT INTO inscripciones (ID_usuario, ID_evento, estado, pos) 
            VALUES (?, ?, ?, ?)`;
        await db.query(queryInscribir, [userId, eventId, estado, posicion]);

        // Actualizar la posición de la cola si está en espera
        if (estado === 'en_espera') {
            const queryActualizarCola = `
                UPDATE eventos 
                SET pos_cola = ? 
                WHERE ID = ?`;
            await db.query(queryActualizarCola, [posicion, eventId]);
        }

        return res.status(200).json({ message: mensaje, estado, titulo});
    } catch (error) {
        console.error('Error al inscribirse:', error);
        return res.status(500).json({ message: 'Ocurrió un error al procesar tu inscripción.', titulo: "Error" });
    }
});

router.post('/cancelar/:id', async (req, res) => {
    const userId = req.session.userId;
    const eventId = req.params.id;

    if (!userId) {
        return res.redirect('/login');
    }

    try {
        // Verificar si el usuario está inscrito o en espera
        const queryInscripcion = `
            SELECT estado 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
        const [inscripcion] = await db.query(queryInscripcion, [userId, eventId]);

        if (!inscripcion) {
            return res.status(400).json({ message: 'No tienes una inscripción en este evento.' });
        }

        if (inscripcion.estado === 'inscrito') {
            // Si está inscrito, buscar el siguiente en la cola
            const querySiguienteEnCola = `
                SELECT ID_usuario 
                FROM inscripciones 
                WHERE ID_evento = ? AND estado = 'en_espera' 
                ORDER BY pos ASC LIMIT 1`;
            const [siguiente] = await db.query(querySiguienteEnCola, [eventId]);

            if (siguiente) {
                // Actualizar al siguiente como inscrito
                const queryActualizarSiguiente = `
                    UPDATE inscripciones 
                    SET estado = 'inscrito', pos = 0 
                    WHERE ID_usuario = ? AND ID_evento = ?`;
                await db.query(queryActualizarSiguiente, [siguiente.ID_usuario, eventId]);
            }
        }

        // Eliminar la inscripción del usuario actual
        const queryEliminarInscripcion = `
            DELETE FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
        await db.query(queryEliminarInscripcion, [userId, eventId]);

        return res.status(200).json({ message: 'Tu inscripción ha sido cancelada.', titulo : 'Adios!'});
    } catch (error) {
        console.error('Error al cancelar inscripción:', error);
        return res.status(500).json({ message: 'Ocurrió un error al cancelar tu inscripción.', titulo: 'Error'});
    }
});





module.exports = router;