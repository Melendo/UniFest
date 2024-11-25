"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const nombre = req.session.nombre;
    const { titulo, fecha, llenos, estado } = req.query;

    try {
        // Consulta eventos próximos
        const queryProximos = 'SELECT * FROM eventos WHERE fecha > NOW() ORDER BY fecha ASC LIMIT 5';
        const resProximos = await db.query(queryProximos);
        resProximos.forEach(evento => {
            evento.fecha = db.formatearFecha(evento.fecha);
        });

        // Lógica para el buscador
        let queryBuscar = 'SELECT * FROM eventos WHERE activo = 1 AND fecha >= NOW()';
        const params = [];

        if (titulo) {
            queryBuscar += ' AND título LIKE ?';
            params.push(`%${titulo}%`);
        }

        if (fecha) {
            queryBuscar += ' AND fecha = ?';
            params.push(fecha);
        }

        if (estado === "llenos") {
            queryBuscar += ` AND ID IN ( SELECT e.ID FROM eventos e LEFT JOIN inscripciones i ON e.ID = i.ID_evento AND i.estado = 'inscrito' GROUP BY e.ID, e.capacidad_máxima HAVING COUNT(i.ID) >= e.capacidad_máxima )`;
        }

        if (estado === "disponibles") {
            queryBuscar += ` AND ID IN ( SELECT e.ID FROM eventos e LEFT JOIN inscripciones i ON e.ID = i.ID_evento AND i.estado = 'inscrito' GROUP BY e.ID, e.capacidad_máxima HAVING COUNT(i.ID) < e.capacidad_máxima)` ;
        }

        queryBuscar += 'ORDER BY fecha ASC';

        const resultados = await db.query(queryBuscar, params);
        resultados.forEach(evento => {
            evento.fecha = db.formatearFecha(evento.fecha);
        });

        res.render('home', { rol: req.session.rol, nombre, proximos: resProximos, resultados });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ message: 'Hubo un error al procesar la solicitud.' });
    }
});

//Obtener todos los eventos para el FullCalendar
router.get('/obtenerEventos', async (req, res) => {

    try {
        // Consulta para obtener los eventos futuros
        const eventos = await db.query('SELECT * FROM eventos WHERE fecha >= NOW()');
        
        // Formatear los eventos en un formato que FullCalendar espera
        const eventosFormateados = eventos.map(evento => ({
            title: evento.título,
            start: evento.fecha,
            end: evento.fecha,
        }));

        // Responde con los eventos en formato JSON
        res.json(eventosFormateados);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).send('Error al obtener eventos');
    }
});



module.exports = router;