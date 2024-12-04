"use strict";

//Dependencias
var express = require('express');
var router = express.Router();

//Ruta para cargar el inicio de la aplicación
router.get('/', function(req, res) {
  res.render('index');
});

module.exports = router;
