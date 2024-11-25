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
      error: { status: 404, stack: "No se encontró la página requerida." }
    });
  }

  try {
    //Consulta eventos proximos
    const queryProximos =
      "SELECT * FROM eventos WHERE fecha > NOW() AND eventos.ID_org = ? ORDER BY fecha ASC";
    const resProximos = await db.query(queryProximos, [req.session.userId]);

    resProximos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    const queryTodasFacultades = "SELECT * FROM facultades";
    const resTodasFacultades = await db.query(queryTodasFacultades);

    res.render("misEventos", {
      rol: req.session.rol,
      proximos: resProximos,
      todasFacultades: resTodasFacultades,
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
    // Calcular hora de inicio y fin del nuevo evento
    const horaInicio = new Date(`${fecha}T${hora}`);
    const horaFin = new Date(horaInicio.getTime() + duración * 60000);

    // Comprobar si ya existe un evento en conflicto
    const conflictQuery = `
      SELECT * FROM eventos 
      WHERE 
        fecha = ? AND 
        ubicación = ? AND 
        ID_facultad = ? AND 
        (
          (hora BETWEEN ? AND ?) OR
          (ADDTIME(hora, SEC_TO_TIME(duración_minutos * 60)) BETWEEN ? AND ?) OR
          (hora <= ? AND ADDTIME(hora, SEC_TO_TIME(duración_minutos * 60)) >= ?)
        )
    `;
    const conflictParams = [
      fecha,
      ubicación,
      facultad,
      horaInicio.toISOString().slice(11, 19), // Formato HH:MM:SS
      horaFin.toISOString().slice(11, 19),
      horaInicio.toISOString().slice(11, 19),
      horaFin.toISOString().slice(11, 19),
      horaInicio.toISOString().slice(11, 19),
      horaFin.toISOString().slice(11, 19),
    ];

    const conflicts = await db.query(conflictQuery, conflictParams);

    if (conflicts.lenght > 0) {
      return res
        .status(400)
        .json({ message: "Ya existe un evento en el mismo lugar y horario." });
    }

    // Si no hay conflictos, insertar el nuevo evento
    const query = `
      INSERT INTO eventos (título, descripción, fecha, hora, duración_minutos, ubicación, ID_facultad, capacidad_máxima, ID_org, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      título,
      descripción,
      fecha,
      hora,
      duración,
      ubicación,
      facultad,
      capacidad_máxima,
      req.session.userId,
      1,
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
      error: { status: 404, stack: "No se encontró la página requerida." }
    });
  }

  res.render("misInscripciones", { rol: req.session.rol });
});

module.exports = router;
