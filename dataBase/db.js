"use strict";

const mysql = require("mysql");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aw_24",
});

function query(sql, params, callback) {
  //console.log("Iniciando consulta a la base de datos...");

  pool.getConnection((err, connection) => {
    if (err) {
      console.log("Error al obtener conexión:", err);
      return callback(err);
    }

    //console.log("Conexión establecida con éxito.");

    connection.query(sql, params, (error, results) => {
      connection.release(); // Libera la conexión una vez terminada la consulta
      if (error) {
        console.log("Error en la consulta:", error);
        return callback(error);  // Si hay un error en la consulta, pasa el error al callback
      }

      //console.log("Consulta ejecutada correctamente");

      callback(null, results);
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
