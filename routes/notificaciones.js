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
    const query = `SELECT * FROM notificaciones WHERE ID_usuario = ? AND activo = 1 ORDER BY leido ASC, fecha DESC`;
    const notificaciones = await db.query(query, [req.session.userId]);

    notificaciones.forEach((notificacion) => {
      notificacion.fecha = db.formatearFecha(notificacion.fecha);
    });

    res.render("notificaciones", {
      bandeja: notificaciones,
      rol: req.session.rol,
      color: req.session.color,
      font: req.session.font,
    });
  } catch (error) {
    console.error("Error al cargar la bandeja de entrada:", error);
    return res.status(500).json({
      message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
    });
  }
});

router.post("/marcar-leida/:id", async (req, res) => {
  const notificacionId = req.params.id;
  console.log(notificacionId);
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    // Actualizar el estado de la notificación a "leída"
    const query = `
      UPDATE notificaciones
      SET leido = 1
      WHERE ID = ?;
    `;

    await db.query(query, [notificacionId]);

    // Devolver una respuesta exitosa
    return res.status(200).json({
      titulo: "Notificación marcada como leída",
      message: "La notificación se ha marcado como leída correctamente.",
    });
  } catch (error) {
    // Si ocurre un error al hacer la consulta, manejar el error
    console.error(
      "Error al marcar notificación como leída:",
      error.message,
      error.sql
    );
    return res
      .status(500)
      .json({
        message:
          "Error al marcar la notificación como leída. Inténtelo de nuevo.",
      });
  }
});

module.exports = router;
