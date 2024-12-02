"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");
var bcrypt = require("bcrypt");

//Carga página login
router.get("/", function (req, res) {
  res.render("login");
});

router.post("/login", (req, res) => {
  // Obtención de datos
  const { correo, contraseña } = req.body;

  // Consulta SQL para verificar si el correo existe
  const query = "SELECT * FROM usuarios WHERE correo = ?";
  db.query(query, [correo], (err, user) => {
    if (err) {
      console.error("Error al consultar el correo:", err);
      return res
        .status(500)
        .json({
          message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
        });
    }

    // Verifica si el usuario existe
    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }

    // Verifica la contraseña
    bcrypt.compare(contraseña, user[0].contrasenia, (err, isPasswordValid) => {
      if (err) {
        console.error("Error al comparar la contraseña:", err);
        return res
          .status(500)
          .json({
            message: "Hubo un error al procesar la contraseña. Intenta de nuevo.",
          });
      }

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Contraseña incorrecta." });
      }

      // Si las credenciales son correctas, guardar la sesión
      req.session.userId = user[0].ID; // Guardar el ID del usuario en la sesión
      req.session.nombre = user[0].nombre; // Guardar el nombre del usuario en la sesión
      req.session.rol = user[0].organizador; // Guardamos el rol en las cookies (1 organizador, 0 usuario)

      // Consulta para verificar configuración de accesibilidad
      const queryConf = "SELECT * FROM conf_accesibilidad WHERE ID_usuario = ?";
      db.query(queryConf, [req.session.userId], (err, resConf) => {
        if (err) {
          console.error("Error al consultar la configuración de accesibilidad:", err);
          return res
            .status(500)
            .json({
              message: "Hubo un error al procesar la configuración. Intenta de nuevo.",
            });
        }

        if (!resConf || resConf.length === 0) {
          // Si no existe la configuración, la insertamos
          const confQuery = "INSERT INTO conf_accesibilidad (ID_usuario) VALUES (?)";
          db.query(confQuery, [req.session.userId], (err) => {
            if (err) {
              console.error("Error al insertar configuración de accesibilidad:", err);
              return res
                .status(500)
                .json({
                  message: "Hubo un error al insertar la configuración.",
                });
            }

            req.session.color = 'claro';
            req.session.font = 'normal';
            // Responder con éxito
            return res
              .status(200)
              .json({ message: "Inicio de sesión exitoso", redirect: "/dashboard" });
          });
        } else {
          // Si la configuración existe, actualizar la sesión
          req.session.color = resConf[0].colores;
          req.session.font = resConf[0].t_size;

          // Responder con éxito
          return res
            .status(200)
            .json({ message: "Inicio de sesión exitoso", redirect: "/dashboard" });
        }
      });
    });
  });
});


router.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).send("No se pudo cerrar sesión");
    }
    res.redirect("/login"); // Redirige al login tras cerrar sesión
  });
});

module.exports = router;
