"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

router.post("/guardarConf", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const { esquema_colores, tamaño_letra } = req.body;
  req.session.color = esquema_colores;
  req.session.font = tamaño_letra;

  try {
    const query = "SELECT * FROM conf_accesibilidad WHERE ID_usuario = ?";
    const [resConf] = await db.query(query, req.session.userId);

    if (!resConf) {
      const confQuery = `
      INSERT INTO conf_accesibilidad (ID_usuario)
      VALUES (?)`;

      // Ejecutar la consulta de inserción en la base de datos
      await db.query(confQuery, req.session.userId);
    }

    // Actualizar configuración existente
    const queryUpdate = `
        UPDATE conf_accesibilidad
        SET colores = ?, t_size = ?
        WHERE ID_usuario = ?
      `;
    await db.query(queryUpdate, [esquema_colores, tamaño_letra, req.session.userId]);

    return res
      .status(200)
      .json({ message: "Configuración actualizada correctamente." });
  } catch (error) {
    console.error("Error al cargar la configuración de accesibilidad:", error);
    return res.status(500).json({ message: "Error al cargar la configuración." });
  }
});

module.exports = router;
