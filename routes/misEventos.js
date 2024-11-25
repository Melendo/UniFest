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
    ubicación,
    facultad,
    capacidad_máxima,
  } = req.body;

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    // Consulta SQL para insertar los datos en la base de datos
    const query = `
          INSERT INTO eventos (título, descripción, fecha, hora, ubicación, ID_facultad, capacidad_máxima, ID_org, activo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const params = [
      título,
      descripción,
      fecha,
      hora,
      ubicación,
      facultad,
      capacidad_máxima,
      req.session.userId,
      1,
    ];

    await db.query(query, params);

    // Si todo es exitoso, redirigir al usuario al login
    return res.status(200).json({ message: "Alta de evento exitosa." });
  } catch (error) {
    // Si ocurre un error al hacer el hash o la consulta, enviar un error 500
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
  res.render("misInscripciones", { rol: req.session.rol });
});

module.exports = router;
