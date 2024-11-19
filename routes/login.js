"use strict";
var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');
var bcrypt = require('bcrypt');

//Carga página login
router.get('/', function(req, res) {
  res.render('login');
});

router.post('/login',  async (req, res) => {
  //Obtencion de datos
  const {correo, contraseña} = req.body;
  
  try{
    // Consulta SQL para verificar si el correo existe
    const query = 'SELECT * FROM usuarios WHERE correo = ?';
    const [user] = await db.query(query, [correo]);
    
    // Verifica si el usuario existe
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }
    
    // Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contrasenia);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }
    
    // Si las credenciales son correctas, guardar la sesión
    req.session.userId = user.ID; // Guardar el ID del usuario en la sesión
    req.session.nombre = user.nombre; // Guardar el nombre del usuario en la sesión
    
    // Responder con éxito, redirigir a otra página o mandar un mensaje de éxito
    return res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: '/dashboard' });
    
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
  }
});

module.exports = router;
