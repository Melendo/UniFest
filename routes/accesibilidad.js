"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

router.post("/guardarConf", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const { esquema_colores, tamaño_letra } = req.body;
  req.session.color = esquema_colores;
  req.session.font = tamaño_letra;

  // Consulta para verificar si ya existe la configuración
  const query = "SELECT * FROM conf_accesibilidad WHERE ID_usuario = ?";
  db.query(query, [req.session.userId], (err, resConf) => {
    if (err) {
      console.error("Error al cargar la configuración de accesibilidad:", err);
      return res.status(500).json({ message: "Error al cargar la configuración." });
    }

    if (!resConf || resConf.length === 0) {
      // Si no existe la configuración, insertamos una nueva
      const confQuery = "INSERT INTO conf_accesibilidad (ID_usuario) VALUES (?)";
      db.query(confQuery, [req.session.userId], (err) => {
        if (err) {
          console.error("Error al insertar configuración de accesibilidad:", err);
          return res.status(500).json({ message: "Error al insertar configuración." });
        }

        // Ahora actualizamos la configuración
        const queryUpdate = `
          UPDATE conf_accesibilidad
          SET colores = ?, t_size = ?
          WHERE ID_usuario = ?
        `;
        db.query(queryUpdate, [esquema_colores, tamaño_letra, req.session.userId], (err) => {
          if (err) {
            console.error("Error al actualizar la configuración de accesibilidad:", err);
            return res.status(500).json({ message: "Error al actualizar la configuración." });
          }

          return res.status(200).json({ message: "Configuración actualizada correctamente." });
        });
      });
    } else {
      // Si la configuración ya existe, la actualizamos directamente
      const queryUpdate = `
        UPDATE conf_accesibilidad
        SET colores = ?, t_size = ?
        WHERE ID_usuario = ?
      `;
      db.query(queryUpdate, [esquema_colores, tamaño_letra, req.session.userId], (err) => {
        if (err) {
          console.error("Error al actualizar la configuración de accesibilidad:", err);
          return res.status(500).json({ message: "Error al actualizar la configuración." });
        }

        return res.status(200).json({ message: "Configuración actualizada correctamente." });
      });
    }
  });
});


module.exports = router;
