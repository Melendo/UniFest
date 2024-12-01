"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

router.get("/", async (req, res) => {
  res.status(404, { message: "page not found" });
});

router.get("/misEventos", async (req, res) => {
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

  try {
    //Consulta eventos proximos
    const queryProximos =
      "SELECT * FROM eventos WHERE fecha > NOW() AND activo = 1 AND eventos.ID_org = ? ORDER BY fecha ASC";
    const resProximos = await db.query(queryProximos, [req.session.userId]);

    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    const queryTodasFacultades = "SELECT * FROM facultades";
    const resTodasFacultades = await db.query(queryTodasFacultades);

    // Consulta para contar las notificaciones no leídas del usuario
    const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
    const resNoti = await db.query(queryNoti, [req.session.userId]);

    const hayNotificaciones = resNoti[0].hayNotificaciones;

    res.render("misEventos", {
      rol: req.session.rol,
      proximos: resProximos,
      todasFacultades: resTodasFacultades,
      color: req.session.color,
      font: req.session.font,
      hayNotificaciones,
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    return res.status(500).json({
      message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
    });
  }
});

router.post("/anyadir", async (req, res) => {
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

  try {
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

    const conflicts = await db.query(conflictQuery, conflictParams);

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

    await db.query(query, params);

    // Si todo es exitoso, devolver éxito
    return res.status(200).json({ message: "Alta de evento exitosa." });
  } catch (error) {
    // Si ocurre un error al hacer la consulta, manejar el error
    console.error("Error al registrar nuevo evento:", error.message, error.sql);
    return res
      .status(500)
      .json({ message: "Error al registrar el evento. Inténtelo de nuevo." });
  }
});

router.get("/misInscripciones", async (req, res) => {
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

  try {
    //Consulta eventos proximos
    const queryProximos =
      "SELECT eventos.título, eventos.fecha, eventos.ID FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_usuario = ? AND inscripciones.estado = 'inscrito' AND eventos.fecha > NOW() ORDER BY eventos.fecha DESC";
    const resProximos = await db.query(queryProximos, [req.session.userId]);

    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    //Consulta eventos proximos
    const queryEspera =
      "SELECT eventos.título, eventos.fecha, eventos.ID FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_usuario = ? AND inscripciones.estado = 'en_espera' AND eventos.fecha > NOW() ORDER BY eventos.fecha DESC";
    const resEspera = await db.query(queryEspera, [req.session.userId]);

    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    resEspera.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    // Consulta para contar las notificaciones no leídas del usuario
    const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
    const resNoti = await db.query(queryNoti, [req.session.userId]);

    const hayNotificaciones = resNoti[0].unreadCount;

    res.render("misInscripciones", {
      rol: req.session.rol,
      proximos: resProximos,
      espera: resEspera,
      color: req.session.color,
      font: req.session.font,
      hayNotificaciones,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
    });
  }
});

module.exports = router;
