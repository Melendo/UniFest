"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

router.get("/", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

router.get("/misEventos", (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect("/login"); // Redirigir al login si no está autenticado
  }

  if (!req.session.rol) {
    return res.status(404).render("error", {
      message: "Página no encontrada",
      error: { status: 404, stack: "No se encontró la página requerida." },
    });
  }

  // Consulta eventos próximos
  const queryProximos =
    "SELECT * FROM eventos WHERE fecha > NOW() AND activo = 1 AND eventos.ID_org = ? ORDER BY fecha ASC";
  
  db.query(queryProximos, [req.session.userId], (errProximos, resProximos) => {
    if (errProximos) {
      console.error("Error al obtener los eventos próximos:", errProximos);
      return res.status(500).json({
        message: "Error al obtener eventos próximos. Intenta de nuevo.",
      });
    }

    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    // Consulta para obtener todas las facultades
    const queryTodasFacultades = "SELECT * FROM facultades";
    
    db.query(queryTodasFacultades, (errFacultades, resTodasFacultades) => {
      if (errFacultades) {
        console.error("Error al obtener todas las facultades:", errFacultades);
        return res.status(500).json({
          message: "Error al obtener facultades. Intenta de nuevo.",
        });
      }

      // Consulta para contar las notificaciones no leídas del usuario
      const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;

      db.query(queryNoti, [req.session.userId], (errNoti, resNoti) => {
        if (errNoti) {
          console.error("Error al obtener notificaciones:", errNoti);
          return res.status(500).json({
            message: "Error al obtener notificaciones. Intenta de nuevo.",
          });
        }

        const hayNotificaciones = resNoti[0].hayNotificaciones;

        // Renderizar la vista de misEventos
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


router.post("/anyadir", (req, res) => {
  const {
    título,
    descripción,
    tipo,
    fecha,
    hora,
    duración,
    ubicación,
    facultad,
    capacidad_máxima,
  } = req.body;

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  // Consulta para verificar conflictos de horario
  const conflictQuery = `
    SELECT *
    FROM eventos
    WHERE TIMESTAMP(fecha, hora) < DATE_ADD(TIMESTAMP(?, ?), INTERVAL ? MINUTE)
      AND DATE_ADD(TIMESTAMP(fecha, hora), INTERVAL duración_minutos MINUTE) > TIMESTAMP(?, ?)
      AND ubicación = ? AND ID_facultad = ?
  `;

  const conflictParams = [
    fecha, // Fecha del nuevo evento
    hora, // Hora de inicio del nuevo evento
    duración, // Duración en minutos del nuevo evento
    fecha, // Fecha del nuevo evento
    hora, // Hora de inicio del nuevo evento
    ubicación, // Ubicación del nuevo evento
    facultad,
  ];

  db.query(conflictQuery, conflictParams, (errConflicts, conflicts) => {
    if (errConflicts) {
      console.error("Error al verificar conflictos:", errConflicts);
      return res.status(500).json({ message: "Error al verificar conflictos. Intenta de nuevo." });
    }

    if (conflicts.length > 0) {
      return res
        .status(400)
        .json({ message: "Ya existe un evento en el mismo lugar y horario." });
    }

    // Si no hay conflictos, insertar el nuevo evento
    const query = `
      INSERT INTO eventos (título, descripción, tipo, fecha, hora, duración_minutos, ubicación, ID_facultad, capacidad_máxima, ID_org)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      título,
      descripción,
      tipo,
      fecha,
      hora,
      duración,
      ubicación,
      facultad,
      capacidad_máxima,
      req.session.userId,
    ];

    db.query(query, params, (errInsert, resEvento) => {
      if (errInsert) {
        console.error("Error al insertar el nuevo evento:", errInsert);
        return res
          .status(500)
          .json({ message: "Error al registrar el evento. Inténtalo de nuevo." });
      }

      const eventoId = resEvento.insertId;

      // Si todo es exitoso, devolver éxito
      return res.status(200).json({ message: "Alta de evento exitosa.", eventoId });
    });
  });
});


router.get("/misInscripciones", (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect("/login"); // Redirigir al login si no está autenticado
  }

  if (req.session.rol) {
    return res.status(404).render("error", {
      message: "Página no encontrada",
      error: { status: 404, stack: "No se encontró la página requerida." },
    });
  }

  // Consulta para eventos próximos inscritos
  const queryProximos = `
    SELECT eventos.título, eventos.fecha, eventos.ID
    FROM eventos
    JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
    WHERE inscripciones.ID_usuario = ? 
      AND inscripciones.estado = 'inscrito'
      AND eventos.fecha > NOW()
    ORDER BY eventos.fecha DESC
  `;

  db.query(queryProximos, [req.session.userId], (errProximos, resProximos) => {
    if (errProximos) {
      console.error("Error al obtener eventos próximos inscritos:", errProximos);
      return res.status(500).json({ message: "Error al obtener eventos. Intenta de nuevo." });
    }

    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    // Consulta para eventos próximos en lista de espera
    const queryEspera = `
      SELECT eventos.título, eventos.fecha, eventos.ID
      FROM eventos
      JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
      WHERE inscripciones.ID_usuario = ? 
        AND inscripciones.estado = 'en_espera'
        AND eventos.fecha > NOW()
      ORDER BY eventos.fecha DESC
    `;

    db.query(queryEspera, [req.session.userId], (errEspera, resEspera) => {
      if (errEspera) {
        console.error("Error al obtener eventos en lista de espera:", errEspera);
        return res.status(500).json({ message: "Error al obtener eventos en espera. Intenta de nuevo." });
      }

      resEspera.forEach((evento) => {
        evento.fecha = db.formatearFecha(evento.fecha);
      });

      // Consulta para contar las notificaciones no leídas
      const queryNoti = `
        SELECT COUNT(*) AS hayNotificaciones
        FROM notificaciones
        WHERE leido = 0 AND activo = 1 AND ID_usuario = ?
      `;

      db.query(queryNoti, [req.session.userId], (errNoti, resNoti) => {
        if (errNoti) {
          console.error("Error al obtener notificaciones no leídas:", errNoti);
          return res.status(500).json({ message: "Error al obtener notificaciones. Intenta de nuevo." });
        }

        const hayNotificaciones = resNoti[0].hayNotificaciones;

        // Renderizar la vista
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
