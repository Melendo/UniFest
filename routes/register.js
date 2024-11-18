var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');
var bcrypt = require('bcrypt');

//Carga página registro
router.get('/', function(req, res) {
  res.render('register');
});

router.post('/register', async (req, res) => {
  // Obtención de datos del formulario
  const { nombre, telefono, correo, contrasenia, facultad, esOrganizador } = req.body;
  
  // Validación de formato de teléfono (solo números de 9 dígitos)
  if (!/^\d{9}$/.test(telefono)) {
    return res.status(400).json({ message: 'El número de teléfono debe tener 9 dígitos.' });
  }
  
  // Validación del correo (solo correo de dominio ucm.es)
  const correoSplit = correo.split("@");
  if (correoSplit.length !== 2 || correoSplit[1] !== "ucm.es") {
    return res.status(400).json({ message: 'El correo debe ser un correo institucional de la UCM (@ucm.es).' });
  }
  
  
  // Comprobación de que no exista un usuario con el mismo correo
  const QueryCorreoExiste = 'SELECT * FROM usuarios WHERE correo = ?';
  const [resCorreo] = await db.query(QueryCorreoExiste, [correo]);
  console.log('Validando usuario');
  if (resCorreo) {
    console.log('Error al registrar: El correo ya esta en uso')
    return res.status(400).json({ message: 'El correo ya está registrado.' });
  }

  console.log('Usuario no encontrado');

  
  // Obtención del Id de la facultad, error si no existe
  const QueryFacultadExiste = 'SELECT ID FROM facultades WHERE nombre = ?';
  const [resFacultad] = await db.query(QueryFacultadExiste, [facultad]);
  console.log('Validando la facultad:', facultad);
  
  if (!resFacultad) {
    console.error('Facultad no encontrada en la base de datos:', facultad);
    return res.status(400).json({ message: 'La facultad no existe.' });
  }
  
  console.log('Facultad encontrada, ID:', resFacultad.ID);
  
  
  // Si existe, obtenemos el ID de la facultad
  const idFacultad = resFacultad.ID;
  
  
  
  // Hasheo de la contraseña antes de guardarla en la base de datos
  const hashedPassword = await bcrypt.hash(contrasenia, 10);
  
  try {
    
    // Consulta SQL para insertar los datos en la base de datos
    const query = `
      INSERT INTO usuarios (nombre, correo, telefono, ID_facultad, organizador, contrasenia)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [nombre, correo, telefono, idFacultad, esOrganizador, hashedPassword];
    
    // Ejecutar la consulta de inserción en la base de datos
    await db.query(query, params);
    
    // Si todo es exitoso, redirigir al usuario al login
    return res.status(200).json({ message: 'Registro exitoso, por favor inicie sesión.' });
  } 
  catch (error) {
    // Si ocurre un error al hacer el hash o la consulta, enviar un error 500
    console.error('Error al registrar el usuario:', error.message, error.sql);
    return res.status(500).json({ message: 'Error al registrar el usuario. Inténtelo de nuevo.' });
  }
});

module.exports = router;
