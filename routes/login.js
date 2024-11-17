var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.post('/login',  async (req, res, err) => {
  //Obtencion de datos

  //Validarlos

  //Crear la conexion 

  //Construyes la query

  //Ejecutar query

  //En funcion de respuesta acciones
} )

module.exports = router;
