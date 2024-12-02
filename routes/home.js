"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

router.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const nombre = req.session.nombre;
  const { titulo, fecha_inicio, fecha_fin, facultad, estado, tipo } = req.query;

  // Obtener las facultades
  const queryFacultades = "SELECT * FROM facultades";
  db.query(queryFacultades, [], (err, facultades) => {
    if (err) {
      console.error("Error al obtener las facultades:", err);
      return res.status(500).json({ message: "Hubo un error al obtener las facultades." });
    }

    // Consulta para los eventos próximos
    const queryProximos =
      "SELECT * FROM eventos WHERE activo = 1 AND fecha > NOW() ORDER BY fecha ASC LIMIT 4";
    db.query(queryProximos, [], (err, resProximos) => {
      if (err) {
        console.error("Error al obtener los eventos próximos:", err);
        return res.status(500).json({ message: "Hubo un error al obtener los eventos próximos." });
      }

      resProximos.forEach((evento) => {
        evento.fecha = db.formatearFecha(evento.fecha);
      });

      // Lógica para el buscador
      let queryBuscar =
        "SELECT * FROM eventos WHERE activo = 1 AND fecha >= NOW()";
      const params = [];

      // Filtrar por título
      if (titulo) {
        queryBuscar += " AND título LIKE ?";
        params.push(`%${titulo}%`);
      }

      // Filtrar por fecha de inicio y fin
      if (fecha_inicio) {
        queryBuscar += " AND fecha >= ?";
        params.push(fecha_inicio);
      }
      if (fecha_fin) {
        queryBuscar += " AND fecha <= ?";
        params.push(fecha_fin);
      }

      // Filtrar por facultad
      if (facultad) {
        queryBuscar += " AND ID_facultad = ?";
        params.push(facultad);
      }

      // Filtrar por tipo
      if (tipo) {
        queryBuscar += " AND tipo = ?";
        params.push(tipo);
      }

      // Filtrar por estado (llenos o disponibles)
      if (estado === "llenos") {
        queryBuscar += ` AND ID IN ( SELECT e.ID FROM eventos e LEFT JOIN inscripciones i ON e.ID = i.ID_evento AND i.estado = 'inscrito' GROUP BY e.ID, e.capacidad_máxima HAVING COUNT(i.ID) >= e.capacidad_máxima )`;
      }

      if (estado === "disponibles") {
        queryBuscar += ` AND ID IN ( SELECT e.ID FROM eventos e LEFT JOIN inscripciones i ON e.ID = i.ID_evento AND i.estado = 'inscrito' GROUP BY e.ID, e.capacidad_máxima HAVING COUNT(i.ID) < e.capacidad_máxima)`;
      }

      queryBuscar += " ORDER BY fecha ASC";

      // Ejecutar la búsqueda de eventos
      db.query(queryBuscar, params, (err, resultados) => {
        if (err) {
          console.error("Error al buscar los eventos:", err);
          return res.status(500).json({ message: "Hubo un error al realizar la búsqueda de eventos." });
        }

        resultados.forEach((evento) => {
          evento.fecha = db.formatearFecha(evento.fecha);
        });

        // Consulta para contar las notificaciones no leídas del usuario
        const queryNoti = `SELECT COUNT(*) as hayNotificaciones FROM notificaciones WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
        db.query(queryNoti, [req.session.userId], (err, resNoti) => {
          if (err) {
            console.error("Error al obtener las notificaciones:", err);
            return res.status(500).json({ message: "Hubo un error al obtener las notificaciones." });
          }

          const hayNotificaciones = resNoti[0].hayNotificaciones;

          // Renderizar la vista con los resultados
          res.render("home", {
            rol: req.session.rol,
            nombre,
            proximos: resProximos,
            resultados,
            facultades,
            color: req.session.color,
            font: req.session.font,
            hayNotificaciones,
          });
        });
      });
    });
  });
});

//Obtener todos los eventos para el FullCalendar
router.get("/obtenerEventos", (req, res) => {
  // Consulta para obtener los eventos futuros
  db.query("SELECT * FROM eventos WHERE activo = 1 AND fecha >= NOW()", [], (err, eventos) => {
    if (err) {
      console.error("Error al obtener eventos:", err);
      return res.status(500).send("Error al obtener eventos");
    }

    // Formatear los eventos en un formato que FullCalendar espera
    const eventosFormateados = eventos.map((evento) => ({
      title: evento.título,
      start: evento.fecha,
      end: evento.fecha,
    }));

    // Responde con los eventos en formato JSON
    res.json(eventosFormateados);
  });
});


module.exports = router;
