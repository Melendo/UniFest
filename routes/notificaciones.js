"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

// Ruta GET del perfil
router.get("/", async (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const query = `SELECT * FROM notificaciones WHERE ID_usuario = ? AND leido = 0 AND activo = 1 ORDER BY fecha DESC`;
    const notificaciones = await db.query(query, [req.session.userId]);

    notificaciones.forEach((notificacion) => {
      notificacion.fecha = db.formatearFecha(notificacion.fecha);
    });

    res.render("notificaciones", {
      bandeja: notificaciones,
      rol: req.session.rol,
    });
  } catch (error) {
    console.error("Error al cargar la bandeja de entrada:", error);
    return res.status(500).json({
      message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
    });
  }
});

module.exports = router;
