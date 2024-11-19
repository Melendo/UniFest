"use strict";

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Opciones de la base de datos para sesiones
const dbOptions = {
  host: "localhost",
  user: "root",
  password: "",
  database: "aw_24"
};

// Crear el almacén de sesiones
const sessionStore = new MySQLStore(dbOptions);

// Exportar la configuración de sesiones
const sessionMiddleware = session({
  key: 'session_cookie',      // Nombre de la cookie
  secret: 'miClaveSecreta',   // Clave secreta
  store: sessionStore,        // Almacén de sesiones
  resave: false,              // No guarda sesiones sin cambios
  saveUninitialized: false,   // No guarda sesiones vacías
  cookie: { 
    secure: false,            
    maxAge: 1000 * 60 * 60 * 24 // Duración de 1 día
  }
});

module.exports = sessionMiddleware;
