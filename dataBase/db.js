"use strict";

const mysql = require("mysql");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aw_24",
});

// Función para ejecutar consultas a la base de datos
// function query(sql, params) {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) {
//         reject(err);
//       } else {
//         connection.query(sql, params, (error, results) => {
//           connection.release(); // Libera la conexión una vez terminada la consulta
//           if (error) {
//             reject(error);
//           } else {
//             resolve(results);
//           }
//         });
//       }
//     });
//   });
// }

function query(sql, params, callback) {
  console.log("Iniciando consulta a la base de datos...");

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al obtener conexión:", err);
      return callback(err);  // Si hay un error al obtener la conexión, pasa el error al callback
    }

    console.log("Conexión establecida con éxito.");

    connection.query(sql, params, (error, results) => {
      connection.release(); // Libera la conexión una vez terminada la consulta
      if (error) {
        console.error("Error en la consulta:", error);
        return callback(error);  // Si hay un error en la consulta, pasa el error al callback
      }

      console.log("Consulta ejecutada correctamente. Resultados:", results);
      callback(null, results);  // Llama al callback con null para el error y los resultados
    });
  });
}

function formatearFecha(fecha) {
  const fechaObj = new Date(fecha);
  const dia = fechaObj.getDate().toString().padStart(2, "0"); // Día con 2 dígitos
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0"); // Mes (enero es 0, así que sumamos 1)
  const anio = fechaObj.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
  return `${dia}/${mes}/${anio}`;
}

function formatearFechaEditar(fecha) {
  const fechaObj = new Date(fecha);
  const anio = fechaObj.getFullYear();
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
  const dia = fechaObj.getDate().toString().padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

module.exports = { query, formatearFecha, formatearFechaEditar };
