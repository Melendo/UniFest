"use strict";

//Dependencias
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

//Ruta para ver el perfil
router.get("/", (req, res) => {

  //Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  //Obtnemos datos usuario
  const queryUsuario = "SELECT * FROM usuarios WHERE id = ?";
  db.query(queryUsuario, [req.session.userId], (err, user) => {

    if (err) {
      console.log("Error al obtener datos del usuario:", err);
      return res.status(500).json({ message: "Error al procesar la solicitud." });
    }

    //Comprobamos si el usuario existe
    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }

    //Obtenemos la facultad del usuario
    const queryFacultad = "SELECT nombre FROM facultades WHERE id = ?";
    db.query(queryFacultad, [user[0].ID_facultad], (err, resfacultad) => {
      if (err) {
        console.log("Error al obtener la facultad:", err);
        return res.status(500).json({ message: "Error al procesar la solicitud." });
      }

      //Historial de eventos
      let queryEventosPasados;
      if (req.session.rol === 0) {
        queryEventosPasados = "SELECT eventos.título, eventos.fecha, eventos.ID FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_usuario = ? AND inscripciones.estado = 'inscrito' AND inscripciones.activo = 1 AND eventos.fecha < NOW() AND eventos.activo = 1 ORDER BY eventos.fecha DESC";
      } 
      else {
        queryEventosPasados = "SELECT eventos.título, eventos.fecha, eventos.ID FROM eventos WHERE ID_org = ? AND eventos.fecha < NOW() AND eventos.activo = 1 ORDER BY eventos.fecha DESC";
      }

      db.query(queryEventosPasados, [req.session.userId], (err, resEventos) => {

        if (err) {
          console.log("Error al obtener eventos:", err);
          return res.status(500).json({ message: "Error al procesar la solicitud." });
        }

        resEventos.forEach((evento) => {
          evento.fecha = db.formatearFecha(evento.fecha);
        });

        //Obtenemos todas las facultades
        const queryTodasFacultades = "SELECT * FROM facultades";
        db.query(queryTodasFacultades, (err, resTodasFacultades) => {

          if (err) {
            console.log("Error al obtener facultades:", err);
            return res.status(500).json({ message: "Error al procesar la solicitud." });
          }

          //Comprobamos si hay notificaciones sin leer
          const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
          db.query(queryNoti, [req.session.userId], (err, resNoti) => {

            if (err) {
              console.log("Error al obtener notificaciones:", err);
              return res.status(500).json({ message: "Error al procesar la solicitud." });
            }

            const hayNotificaciones = resNoti[0].hayNotificaciones;

            //Renderizamos el perfil
            res.render("profile", {
              user: user[0],
              facultad: resfacultad[0],
              rol: req.session.rol,
              historial: resEventos,
              todasFacultades: resTodasFacultades,
              color: req.session.color,
              font: req.session.font,
              hayNotificaciones,
            });
          });
        });
      });
    });
  });
});

//Ruta para actualizar los datos del usuario
router.post("/actualizar", (req, res) => {

  //Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  //Obtenemos los datos
  const { nombre, telefono, facultad } = req.body;

  //Actualizamos los datos del usuario
  const query = `UPDATE usuarios  SET nombre = ?, telefono = ?, ID_facultad = ? WHERE id = ?;`;
  db.query(query, [nombre, telefono, facultad, req.session.userId], (err, result) => {

    if (err) {
      console.log("Error al actualizar el perfil:", err);
      return res.status(500).json({
        success: false,
        message: "Hubo un error al actualizar el perfil. Intenta de nuevo.",
      });
    }

    //Comprobamos si algo cambió
    if (result.affectedRows > 0) {
      req.session.nombre = nombre;

      return res.json({success: true,message: "Perfil actualizado con éxito."});
    } 
    else {
      return res.status(400).json({success: false,message: "No se pudieron actualizar los datos del perfil."});
    }
  });
});


module.exports = router;
