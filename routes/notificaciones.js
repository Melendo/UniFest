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
    // Consulta datos usuario
    const queryUsuario = "SELECT * FROM usuarios WHERE id = ?";
    const [user] = await db.query(queryUsuario, [req.session.userId]);

    res.render("notificaciones");
  } catch (error) {
    console.error("Error al cargar la bandeja de entrada:", error);
    return res
      .status(500)
      .json({
        message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
      });
  }
});
