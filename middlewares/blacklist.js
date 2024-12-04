"use strict";

//Dependencias
const db = require('../dataBase/db'); 

//Keywords injección SQL
const sqlKeywords = [
  "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "--", ";", "/*", "*/", "xp_"
];

// Middleware para detectar inyecciones SQL y añadir las ips a la base de datos
async function sqlInjectionDetector(req, res, next) {

  try {
    const ip = req.ip; 
    const requestData = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);

    // Verificar si la IP está bloqueada
    const query = `SELECT * FROM blacklist WHERE ip = ?`;
    db.query(query, [ip], (err, results) => {

      //Si hay error en la query
      if (err) {
        console.error("Error al consultar la lista negra:", err);
        return res.status(500).send("Error interno del servidor.");
      }

       //Si la IP está bloqueada, denegar la solicitud
      if (results.length > 0) {
        const fechaBloqueo = results[0].fecha_bloqueo; // Usamos el campo fecha_bloqueo
        return res.status(403).send(`Tu acceso ha sido bloqueado desde: ${fechaBloqueo}`);
      }

      //Buscar palabras clave de inyección SQL
      const containsSqlKeywords = sqlKeywords.some(keyword =>
        requestData.toUpperCase().includes(keyword)
      );

      // Si se detectan inyecciones SQL, registrar la IP en la tabla blacklist
      if (containsSqlKeywords) {
        const insertQuery = `INSERT INTO blacklist (ip, fecha_bloqueo) VALUES (?, NOW())`;
        db.query(insertQuery, [ip], (err) => {

          //Si la query da error sin contar entradas duplicadas
          if (err && err.code !== 'ER_DUP_ENTRY') {
            console.error("Error al insertar en la lista negra:", err);
          }
        });

        console.warn(`Inyección SQL detectada y bloqueada para la IP: ${ip}`);
        return res.status(403).send("Tu acceso ha sido bloqueado debido a actividad sospechosa.");
      }

      // Continuar con la solicitud si no hay problemas
      next();
    });
  } 
  catch (error) {
    console.error("Error en el middleware SQL Injection Detector:", error);
    res.status(500).send("Error interno del servidor.");
  }
}

module.exports = sqlInjectionDetector;
