"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

// Ruta GET del perfil
router.get("/", (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  const query = `SELECT * FROM notificaciones WHERE ID_usuario = ? AND activo = 1 ORDER BY leido ASC, fecha DESC`;

  db.query(query, [req.session.userId], (err, notificaciones) => {
    if (err) {
      console.log("Error al obtener las notificaciones:", err);
      return res.status(500).json({
        message: "Error al cargar las notificaciones.",
      });
    }

    // Formatear las fechas de las notificaciones
    notificaciones.forEach((notificacion) => {
      notificacion.fecha = db.formatearFecha(notificacion.fecha);
    });

    // Consulta para contar las notificaciones no leídas
    const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;

    db.query(queryNoti, [req.session.userId], (err, resNoti) => {
      if (err) {
        console.log("Error al contar las notificaciones no leídas:", err);
        return res.status(500).json({
          message: "Error al procesar la solicitud.",
        });
      }

      const hayNotificaciones = resNoti[0].hayNotificaciones;

      // Renderizar la vista
      res.render("notificaciones", {
        bandeja: notificaciones,
        rol: req.session.rol,
        color: req.session.color,
        font: req.session.font,
        hayNotificaciones,
      });
    });
  });
});


router.post("/marcar-leida/:id", (req, res) => {
  const notificacionId = req.params.id;
  console.log("ID de notificación a marcar como leída:", notificacionId);

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  // Actualizar el estado de la notificación a "leída"
  const query = `
    UPDATE notificaciones
    SET leido = 1
    WHERE ID = ?;
  `;

  db.query(query, [notificacionId], (err, result) => {
    if (err) {
      console.log(
        "Error al marcar la notificación como leída:",
        err.message,
        err.sql
      );
      return res.status(500).json({
        message:
          "Error al marcar la notificación como leída. Inténtelo de nuevo.",
      });
    }

    // Verificar si alguna fila fue afectada
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "La notificación no fue encontrada.",
      });
    }

    // Devolver una respuesta exitosa
    return res.status(200).json({
      titulo: "Notificación marcada como leída",
      message: "La notificación se ha marcado como leída correctamente.",
    });
  });
});


module.exports = router;
