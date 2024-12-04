"use strict";

//Dependencias
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

//Ruta para ver los eventos del organizador
router.get("/misEventos", (req, res) => {
  
  //Validación de usuario logueado
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  
  
  
  //Obtenemos los próximos eventos
  const queryProximos ="SELECT * FROM eventos WHERE fecha > NOW() AND activo = 1 AND eventos.ID_org = ? ORDER BY fecha ASC";
  db.query(queryProximos, [req.session.userId], (errProximos, resProximos) => {

    if (errProximos) {
      console.log("Error al obtener los eventos próximos:", errProximos);
      return res.status(500).json({
        message: "Error al obtener eventos próximos. Intenta de nuevo.",
      });
    }
    
    //Formateo de fechas para mostrarlas
    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });
    
    //Obtenemos todas las facultades
    const queryTodasFacultades = "SELECT * FROM facultades";   
    db.query(queryTodasFacultades, (errFacultades, resTodasFacultades) => {

      if (errFacultades) {
        console.log("Error al obtener todas las facultades:", errFacultades);
        return res.status(500).json({
          message: "Error al obtener facultades. Intenta de nuevo.",
        });
      }
      
      //Comprobamos si hay notificaciones sin leer
      const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
      db.query(queryNoti, [req.session.userId], (errNoti, resNoti) => {

        if (errNoti) {
          console.log("Error al obtener notificaciones:", errNoti);
          return res.status(500).json({
            message: "Error al obtener notificaciones. Intenta de nuevo.",
          });
        }
        
        const hayNotificaciones = resNoti[0].hayNotificaciones;
        
        //Renderizamos la vista de misEventos
        res.render("misEventos", {
          rol: req.session.rol,
          proximos: resProximos,
          todasFacultades: resTodasFacultades,
          color: req.session.color,
          font: req.session.font,
          hayNotificaciones,
        });
      });
    });
  });
});

//Ruta para que un organizador añada un evento
router.post("/anyadir", (req, res) => {

  //Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  //Validación de que sea organizador
  if (!req.session.rol) {
    return res.status(404).render("error", {
      message: "Página no encontrada",
      error: { status: 404, stack: "No se encontró la página requerida." },
    });
  }

  //Obtención de datos
  const {
    título,
    descripción,
    tipo,
    fecha,
    hora,
    duración,
    ubicación,
    facultad,
    capacidad_máxima
  } = req.body;
  
  //Comprobamos conflictos de horario
  const conflictQuery = `
    SELECT *
    FROM eventos
    WHERE TIMESTAMP(fecha, hora) < DATE_ADD(TIMESTAMP(?, ?), INTERVAL ? MINUTE)
      AND DATE_ADD(TIMESTAMP(fecha, hora), INTERVAL duración_minutos MINUTE) > TIMESTAMP(?, ?)
      AND ubicación = ? AND ID_facultad = ?
  `;
  const conflictParams = [fecha, hora, duración, fecha, hora, ubicación, facultad,];
  db.query(conflictQuery, conflictParams, (errConflicts, conflicts) => {

    if (errConflicts) {
      console.log("Error al verificar conflictos:", errConflicts);
      return res.status(500).json({ message: "Error al verificar conflictos. Intenta de nuevo." });
    }
    
    if (conflicts.length > 0) {
      return res
      .status(400)
      .json({ message: "Ya existe un evento en el mismo lugar y horario." });
    }
    
    //Creamos el nuevo evento
    const query = `
      INSERT INTO eventos (título, descripción, tipo, fecha, hora, duración_minutos, ubicación, ID_facultad, capacidad_máxima, ID_org)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [título, descripción, tipo, fecha, hora, duración, ubicación, facultad, capacidad_máxima, req.session.userId];
    db.query(query, params, (errInsert, resEvento) => {

      if (errInsert) {
        console.log("Error al insertar el nuevo evento:", errInsert);
        return res
        .status(500)
        .json({ message: "Error al registrar el evento. Inténtalo de nuevo." });
      }
      
      const eventoId = resEvento.insertId;
      
      return res.status(200).json({ message: "Alta de evento exitosa.", eventoId });
    });
  });
});

//Ruta para visualizar las inscripciones de un usuario
router.get("/misInscripciones", (req, res) => {

  //Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect("/login"); 
  }
  
  //Comprobamos que el rol sea usuario
  if (req.session.rol) {
    return res.status(404).render("error", {
      message: "Página no encontrada",
      error: { status: 404, stack: "No se encontró la página requerida." },
    });
  }
  
  //Próximos eventos en los que está inscrito
  const queryProximos = `
    SELECT eventos.título, eventos.fecha, eventos.ID
    FROM eventos
    JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
    WHERE inscripciones.ID_usuario = ? 
      AND inscripciones.estado = 'inscrito'
      AND inscripciones.activo = 1
      AND eventos.fecha > NOW()
    ORDER BY eventos.fecha DESC`;
  db.query(queryProximos, [req.session.userId], (errProximos, resProximos) => {

    if (errProximos) {
      console.log("Error al obtener eventos próximos inscritos:", errProximos);
      return res.status(500).json({ message: "Error al obtener eventos. Intenta de nuevo." });
    }
    
    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });
    
    //Próximos eventos en lista de espera
    const queryEspera = `
      SELECT eventos.título, eventos.fecha, eventos.ID
      FROM eventos
      JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
      WHERE inscripciones.ID_usuario = ? 
        AND inscripciones.estado = 'en_espera'
        AND inscripciones.activo = 1
        AND eventos.fecha > NOW()
      ORDER BY eventos.fecha DESC`;
    db.query(queryEspera, [req.session.userId], (errEspera, resEspera) => {

      if (errEspera) {
        console.log("Error al obtener eventos en lista de espera:", errEspera);
        return res.status(500).json({ message: "Error al obtener eventos en espera. Intenta de nuevo." });
      }
      
      resEspera.forEach((evento) => {
        evento.fecha = db.formatearFecha(evento.fecha);
      });
      
      //Comprobamos si hay notificaciones sin leer
      const queryNoti = `SELECT COUNT(*) AS hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
      
      db.query(queryNoti, [req.session.userId], (errNoti, resNoti) => {
        
        if (errNoti) {
          console.log("Error al obtener notificaciones no leídas:", errNoti);
          return res.status(500).json({ message: "Error al obtener notificaciones. Intenta de nuevo." });
        }
        
        const hayNotificaciones = resNoti[0].hayNotificaciones;
        
        //Renderizamos la vista de MisInscripciones
        res.render("misInscripciones", {
          rol: req.session.rol,
          proximos: resProximos,
          espera: resEspera,
          color: req.session.color,
          font: req.session.font,
          hayNotificaciones,
        });
      });
    });
  });
});


module.exports = router;
