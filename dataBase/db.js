"use strict";

const mysql = require("mysql");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "aw_24"
});

// Función para ejecutar consultas a la base de datos
function query(sql, params) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          connection.query(sql, params, (error, results) => {
            connection.release(); // Libera la conexión una vez terminada la consulta
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        }
      });
    });
  }
  
  module.exports = { query };
