"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

// Ruta GET del perfil
router.get('/', async (req, res) => {

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect('/login'); 
  }

  try {
    // Consulta datos usuario
    const queryUsuario = 'SELECT * FROM usuarios WHERE id = ?';
    const [user] = await db.query(queryUsuario, [req.session.userId]);

    // Verifica si el usuario existeS
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    } else {
      // Consulta nombre facultad
      const queryFacultad = 'SELECT nombre FROM facultades WHERE id = ?';
      const [resfacultad] = await db.query(queryFacultad, [user.ID_facultad]);

      // Consulta historial de eventos
      const queryEventosPasados = "SELECT eventos.título, eventos.fecha, eventos.ID FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_usuario = ? AND inscripciones.estado = 'inscrito' AND eventos.fecha < NOW() ORDER BY eventos.fecha DESC";
      const resEventos = await db.query(queryEventosPasados, [req.session.userId]);

      resEventos.forEach(evento => {
        evento.fecha = db.formatearFecha(evento.fecha);
      });

      const queryTodasFacultades = 'SELECT * FROM facultades';
      const resTodasFacultades = await db.query(queryTodasFacultades);

      res.render('profile', { user: user, facultad: resfacultad, rol: req.session.rol, historial: resEventos, todasFacultades: resTodasFacultades});
    }

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
  }
});

// Ruta POST para actualizar el perfil
router.post('/actualizar', async (req, res) => {
  const { nombre, telefono, facultad } = req.body;
  
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    // Consulta SQL para actualizar los datos del usuario
    const query = `
      UPDATE usuarios 
      SET nombre = ?, telefono = ?, ID_facultad = ?
      WHERE id = ?;
    `;
    
    // Actualizamos los datos del usuario en la base de datos
    const result = await db.query(query, [nombre, telefono, facultad, req.session.userId]);

    if (result.affectedRows > 0) {
      req.session.nombre = nombre;
      return res.json({ success: true, message: 'Perfil actualizado con éxito.' });
    } 
    else {
      return res.status(400).json({ success: false, message: 'No se pudieron actualizar los datos del perfil.' });
    }

  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return res.status(500).json({ success: false, message: 'Hubo un error al actualizar el perfil. Intenta de nuevo.' });
  }
});

module.exports = router;
