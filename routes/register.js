var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register');
});

router.post('/register', async (req, res) => {
  // Obtención de datos del formulario
  const { nombre, telefono, email, contrasenia, confContrasenia, facultad, esOrganizador} = req.body;

  // Validar que los campos no estén vacíos (si no lo has hecho ya en el frontend)
  if (!nombre || !telefono || !email || !contrasenia || !confContrasenia || !facultad) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // Validación de contraseñas coincidentes
  if (contrasenia !== confContrasenia) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
  }

  // Validación de formato de teléfono (solo números de 9 dígitos)
  if (!/^\d{9}$/.test(telefono)) {
    return res.status(400).json({ message: 'El número de teléfono debe tener 9 dígitos.' });
  }

  // Validación del correo (solo correo de dominio ucm.es)
  const correoSplit = email.split("@");
  if (correoSplit.length !== 2 || correoSplit[1] !== "ucm.es") {
    return res.status(400).json({ message: 'El correo debe ser un correo institucional de la UCM (ucm.es).' });
  }

  // Hashear la contraseña antes de guardarla en la base de datos
  try {
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    // Consulta SQL para insertar los datos en la base de datos
    const query = `
      INSERT INTO usuarios (nombre, telefono, correo, ID_facultad, organizador, contrasenia)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [nombre, telefono, email, 1, esOrganizador, hashedPassword];

    // Ejecutar la consulta de inserción en la base de datos
    await db.query(query, params);
    
    // Si todo es exitoso, redirigir al usuario al login
    res.status(200).json({message: 'Registro exitoso, por favor inicie sesión.'});
  } catch (error) {
    // Si ocurre un error al hacer el hash o la consulta, enviar un error 500
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario. Inténtelo de nuevo.' });
  }
});

module.exports = router;
