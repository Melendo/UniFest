"use strict";

//Dependencias
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

//Ruta para cargar las notificaciones
router.get("/", (req, res) => {
  
  //Comprobamos si el usuario está autenticado
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
    
    notificaciones.forEach((notificacion) => {
      notificacion.fecha = db.formatearFecha(notificacion.fecha);
    });
    
    //Comprobamos si hay notificaciones sin leer
    const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
    db.query(queryNoti, [req.session.userId], (err, resNoti) => {
      
      if (err) {
        console.log("Error al contar las notificaciones no leídas:", err);
        return res.status(500).json({
          message: "Error al procesar la solicitud.",
        });
      }
      
      const hayNotificaciones = resNoti[0].hayNotificaciones;
      
      //Renderizamos la bandeja de entrada
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

//Ruta para marcar como leido una notificación
router.post("/marcar-leida/:id", (req, res) => {
  
  // Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }
  
  //Obtención de datos
  const notificacionId = req.params.id;
  
  // Verificamos si la notificación existe y si es del usuario logueado
  const existeQuery = `SELECT * FROM notificaciones WHERE ID = ? AND ID_usuario = ?;`;
  db.query(existeQuery, [notificacionId, req.session.userId], (err, results) => {
    
    if (err) {
      console.log(
        "Error al comprobar la notificación:",
        err
      );
      return res.status(500).json({
        message: "Error al comprobar la notificación. Inténtelo de nuevo.",
      });
    }
    
    //Si no existe la notificación o no pertenece al usuario
    if (results.length === 0) {
      return res.status(404).json({
        message: "Notificación no encontrada o no pertenece al usuario.",
      });
    }
    
    //Actualizamos el estado de la notificación a leído
    const updateQuery = `UPDATE notificaciones SET leido = 1 WHERE ID = ?;`;
    db.query(updateQuery, [notificacionId], (err) => {
      
      if (err) {
        console.log(
          "Error al marcar la notificación como leída:",
          err.message,
          err.sql
        );
        return res.status(500).json({message:"Error al marcar la notificación como leída. Inténtelo de nuevo.",});
      }
      
      return res.status(200).json({titulo: "Notificación marcada como leída", message: "La notificación se ha marcado como leída correctamente."});
    });
  });
});



module.exports = router;
