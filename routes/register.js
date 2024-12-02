var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");
var bcrypt = require("bcrypt");

//Carga página registro
router.get("/", (req, res) => {
  const queryTodasFacultades = "SELECT * FROM facultades";

  db.query(queryTodasFacultades, (err, resTodasFacultades) => {
    if (err) {
      console.error("Error al consultar las facultades:", err);
      return res
        .status(500)
        .json({
          message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
        });
    }

    // Renderizar la vista con las facultades
    res.render("register", { todasFacultades: resTodasFacultades });
  });
});


router.post("/register", (req, res) => {
  // Obtención de datos del formulario
  const { nombre, telefono, correo, contrasenia, facultad, esOrganizador } =
    req.body;

  // Validación de formato de teléfono (solo números de 9 dígitos)
  if (telefono !== "" && !/^\d{9}$/.test(telefono)) {
    return res
      .status(400)
      .json({ message: "El número de teléfono debe tener 9 dígitos o ser vacío." });
  }

  // Validación del correo (solo correo de dominio ucm.es)
  const correoSplit = correo.split("@");
  if (correoSplit.length !== 2 || correoSplit[1] !== "ucm.es") {
    return res
      .status(400)
      .json({
        message:
          "El correo debe ser un correo institucional de la UCM (@ucm.es).",
      });
  }

  // Comprobación de que no exista un usuario con el mismo correo
  const QueryCorreoExiste = "SELECT * FROM usuarios WHERE correo = ?";
  db.query(QueryCorreoExiste, [correo], (err, resCorreo) => {
    if (err) {
      console.error("Error al verificar el correo:", err);
      return res
        .status(500)
        .json({ message: "Error al verificar el correo." });
    }

    if (resCorreo.length > 0) {
      console.log("Error al registrar: El correo ya está en uso");
      return res
        .status(400)
        .json({ message: "El correo ya está registrado." });
    }

    console.log("Usuario no encontrado");

    // Obtención del ID de la facultad, error si no existe
    const QueryFacultadExiste = "SELECT * FROM facultades WHERE ID = ?";
    db.query(QueryFacultadExiste, [facultad], (err, resFacultad) => {
      if (err) {
        console.error("Error al verificar la facultad:", err);
        return res
          .status(500)
          .json({ message: "Error al verificar la facultad." });
      }

      if (resFacultad.length === 0) {
        console.error("Facultad no encontrada en la base de datos:", facultad);
        return res.status(400).json({ message: "La facultad no existe." });
      }

      console.log("Facultad encontrada, ID:", resFacultad[0].ID);

      const idFacultad = resFacultad[0].ID;

      // Hasheo de la contraseña antes de guardarla en la base de datos
      bcrypt.hash(contrasenia, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error al hashear la contraseña:", err);
          return res
            .status(500)
            .json({ message: "Error al procesar la contraseña." });
        }

        // Consulta SQL para insertar los datos en la base de datos
        const query = `
          INSERT INTO usuarios (nombre, correo, telefono, ID_facultad, organizador, contrasenia)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
          nombre,
          correo,
          telefono,
          idFacultad,
          esOrganizador,
          hashedPassword,
        ];

        db.query(query, params, (err, result) => {
          if (err) {
            console.error("Error al insertar el usuario:", err);
            return res
              .status(500)
              .json({ message: "Error al registrar el usuario." });
          }

          const userId = result.insertId;

          // Consulta SQL para insertar configuración de accesibilidad
          const confQuery = `
            INSERT INTO conf_accesibilidad (ID_usuario)
            VALUES (?)
          `;

          db.query(confQuery, [userId], (err) => {
            if (err) {
              console.error("Error al insertar configuración de accesibilidad:", err);
              return res
                .status(500)
                .json({
                  message: "Error al configurar accesibilidad para el usuario.",
                });
            }

            // Respuesta exitosa
            return res
              .status(200)
              .json({
                message: "Registro exitoso, por favor inicie sesión.",
              });
          });
        });
      });
    });
  });
});


module.exports = router;
