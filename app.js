"use strict"

//Importar dependencias
var express = require('express');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require("./dataBase/db");

//Importar rutas
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var profileRouter = require('./routes/profile');
var homeRouter = require('./routes/home');
var eventoRouter = require('./routes/evento');
var misEventosRouter = require('./routes/misEventos');
var notificacionesRouter = require('./routes/notificaciones');
var accesibilidadRouter = require('./routes/accesibilidad');

var sessionMiddleware = require('./dataBase/session');
var blacklist = require('./middlewares/blacklist');
var jobsMiddleware = require('./jobs/cron')


//Definimos el servidor
var app = express();

//Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(blacklist)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));

//Rutas
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/profile', profileRouter);
app.use('/home', homeRouter)
app.use('/evento', eventoRouter);
app.use('/misEventos', misEventosRouter);
app.use('/notificaciones', notificacionesRouter);
app.use('/accesibilidad', accesibilidadRouter);

//Captura error 404 
app.use(function(req, res, next) {
  next(createError(404));
});

//Manejador de errores
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //Carga de la página de error
  res.status(err.status || 500);
  res.render('error',{
    rol: req.session?.rol,
    color: req.session?.color,
    font: req.session?.font,
    hayNotificaciones: false
  });
});

module.exports = app;
