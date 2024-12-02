"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

/* GET home page. */
router.get("/evento/:id", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const idEvento = req.params.id;

  // Consulta del evento
  const queryEvento = "SELECT * FROM eventos WHERE ID = ?";
  db.query(queryEvento, [idEvento], (errEvento, resultEvento) => {
    if (errEvento) {
      console.error("Error al consultar el evento:", errEvento);
      return res.status(500).json({ message: "Error al cargar el evento." });
    }
    const resEvento = resultEvento[0];
    if (!resEvento) {
      return res.status(400).json({ message: "Evento no encontrado." });
    }

    // Obtenemos la capacidad actual
    const queryCapacidad = `
      SELECT COUNT(*) AS inscritos 
      FROM inscripciones 
      WHERE ID_evento = ? AND estado = 'inscrito'`;
    db.query(queryCapacidad, [idEvento], (errCapacidad, resultCapacidad) => {
      if (errCapacidad) {
        console.error("Error al obtener la capacidad actual:", errCapacidad);
        return res.status(500).json({ message: "Error al cargar el evento." });
      }
      const capActual = resultCapacidad[0].inscritos;

      // Formateamos la fecha
      const fechaBD = db.formatearFechaEditar(resEvento.fecha);
      resEvento.fecha = db.formatearFecha(resEvento.fecha);

      // Obtenemos la facultad
      const queryFacultadEvento = "SELECT * FROM facultades WHERE ID = ?";
      db.query(
        queryFacultadEvento,
        [resEvento.ID_facultad],
        (errFacultad, resultFacultad) => {
          if (errFacultad) {
            console.error("Error al obtener la facultad:", errFacultad);
            return res
              .status(500)
              .json({ message: "Error al cargar el evento." });
          }
          const resFacultad = resultFacultad[0];

          // Verificar si el usuario está inscrito o en espera
          const queryInscripcion = `
            SELECT estado 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
          db.query(
            queryInscripcion,
            [req.session.userId, idEvento],
            (errInscripcion, resultInscripcion) => {
              if (errInscripcion) {
                console.error(
                  "Error al verificar la inscripción:",
                  errInscripcion
                );
                return res
                  .status(500)
                  .json({ message: "Error al cargar el evento." });
              }
              const inscripcion = resultInscripcion[0];
              let inscrito = "Inscríbete ya!";
              if (inscripcion?.estado === "inscrito") {
                inscrito = "Cancelar inscripción";
              } else if (inscripcion?.estado === "en_espera") {
                inscrito = "Cancelar espera";
              }

              // Obtener todas las facultades
              const queryTodasFacultades = "SELECT * FROM facultades";
              db.query(queryTodasFacultades, (errFacultades, resultFacultades) => {
                if (errFacultades) {
                  console.error(
                    "Error al obtener las facultades:",
                    errFacultades
                  );
                  return res
                    .status(500)
                    .json({ message: "Error al cargar el evento." });
                }

                // Contar notificaciones no leídas
                const queryNoti = `
                  SELECT COUNT(*) as hayNotificaciones 
                  FROM notificaciones 
                  WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
                db.query(queryNoti, [req.session.userId], (errNoti, resultNoti) => {
                  if (errNoti) {
                    console.error(
                      "Error al contar notificaciones no leídas:",
                      errNoti
                    );
                    return res
                      .status(500)
                      .json({ message: "Error al cargar el evento." });
                  }
                  const hayNotificaciones = resultNoti[0].hayNotificaciones;

                  // Renderizar la página con los datos obtenidos
                  res.render("evento", {
                    rol: req.session.rol,
                    evento: resEvento,
                    facultad: resFacultad,
                    id: req.session.userId,
                    capActual,
                    inscrito,
                    fechaBD,
                    todasFacultades: resultFacultades,
                    color: req.session.color,
                    font: req.session.font,
                    hayNotificaciones,
                  });
                });
              });
            }
          );
        }
      );
    });
  });
});


router.post("/inscribirse/:id", (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  if (!userId) {
    return res.redirect("/login");
  }

  // Verificar si el evento existe y está activo
  const queryEvento =
    "SELECT activo, capacidad_máxima FROM eventos WHERE ID = ?";
  db.query(queryEvento, [eventId], (errEvento, resultEvento) => {
    if (errEvento) {
      console.error("Error al verificar el evento:", errEvento);
      return res.status(500).json({
        message: "Error al verificar el evento. Intenta de nuevo.",
        titulo: "Error",
      });
    }
    const evento = resultEvento[0];
    if (!evento || evento.activo !== 1) {
      return res.status(400).json({
        message: "El evento no está disponible para inscripciones.",
        titulo: "Error",
      });
    }

    // Verificar si el usuario ya está inscrito o en espera
    const queryInscripcion = `
      SELECT * 
      FROM inscripciones 
      WHERE ID_usuario = ? AND ID_evento = ?`;
    db.query(queryInscripcion, [userId, eventId], (errInscripcion, resultInscripcion) => {
      if (errInscripcion) {
        console.error("Error al verificar inscripción:", errInscripcion);
        return res.status(500).json({
          message: "Error al verificar tu inscripción. Intenta de nuevo.",
          titulo: "Error",
        });
      }
      if (resultInscripcion.length > 0) {
        return res.status(400).json({
          message: "Ya estás inscrito o en la cola para este evento.",
          titulo: "Error",
        });
      }

      // Determinar el estado del usuario (inscrito o en espera)
      const queryCapacidadActual = `
        SELECT COUNT(*) AS inscritos 
        FROM inscripciones 
        WHERE ID_evento = ? AND estado = 'inscrito'`;
      db.query(queryCapacidadActual, [eventId], (errCapacidad, resultCapacidad) => {
        if (errCapacidad) {
          console.error("Error al obtener capacidad actual:", errCapacidad);
          return res.status(500).json({
            message: "Error al verificar la capacidad del evento.",
            titulo: "Error",
          });
        }

        const plazasOcupadas = resultCapacidad[0].inscritos;
        const capacidadMaxima = evento.capacidad_máxima;

        let estado = "en_espera";
        let mensaje =
          "El evento está lleno, pero te hemos puesto en la lista de espera.";
        let titulo = "En lista de espera";

        if (plazasOcupadas < capacidadMaxima) {
          estado = "inscrito";
          mensaje = "¡Inscripción completada con éxito!";
          titulo = "Felicidades";
        }

        // Insertar inscripción con la fecha actual
        const queryInscribir = `
          INSERT INTO inscripciones (ID_usuario, ID_evento, estado, fecha) 
          VALUES (?, ?, ?, NOW())`;
        db.query(queryInscribir, [userId, eventId, estado], (errInscribir) => {
          if (errInscribir) {
            console.error("Error al registrar la inscripción:", errInscribir);
            return res.status(500).json({
              message: "Ocurrió un error al procesar tu inscripción.",
              titulo: "Error",
            });
          }

          // Responder con éxito
          return res.status(200).json({
            message: mensaje,
            estado,
            titulo,
            plazasOcupadas,
          });
        });
      });
    });
  });
});


router.post("/cancelar/:id", (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  if (!userId) {
    return res.redirect("/login");
  }

  // Verificar si el usuario está inscrito o en espera
  const queryInscripcion = `
    SELECT estado 
    FROM inscripciones 
    WHERE ID_usuario = ? AND ID_evento = ?`;
  db.query(queryInscripcion, [userId, eventId], (errInscripcion, resultInscripcion) => {
    if (errInscripcion) {
      console.error("Error al verificar inscripción:", errInscripcion);
      return res.status(500).json({
        message: "Error al verificar tu inscripción.",
        titulo: "Error",
      });
    }

    const inscripcion = resultInscripcion[0];
    if (!inscripcion) {
      return res.status(400).json({
        message: "No tienes una inscripción en este evento.",
        titulo: "Error",
      });
    }

    if (inscripcion.estado === "inscrito") {
      // Buscar al siguiente en la lista de espera
      const querySiguienteEnCola = `
        SELECT ID_usuario 
        FROM inscripciones 
        WHERE ID_evento = ? AND estado = 'en_espera' 
        ORDER BY fecha ASC 
        LIMIT 1`;
      db.query(querySiguienteEnCola, [eventId], (errCola, resultCola) => {
        if (errCola) {
          console.error("Error al obtener siguiente en cola:", errCola);
          return res.status(500).json({
            message: "Error al procesar la lista de espera.",
            titulo: "Error",
          });
        }

        const siguiente = resultCola[0];
        if (siguiente) {
          // Actualizar el estado del siguiente como inscrito
          const queryActualizarSiguiente = `
            UPDATE inscripciones 
            SET estado = 'inscrito' 
            WHERE ID_usuario = ? AND ID_evento = ?`;
          db.query(queryActualizarSiguiente, [siguiente.ID_usuario, eventId], (errActualizar) => {
            if (errActualizar) {
              console.error("Error al actualizar estado del siguiente:", errActualizar);
              return res.status(500).json({
                message: "Error al actualizar la inscripción del siguiente en la lista.",
                titulo: "Error",
              });
            }

            const mensaje = `Alguien ha cancelado su inscripción del evento ${eventId} y has pasado de la lista de espera a estar inscrito!`;

            // Notificar al usuario actualizado
            const queryNotificacion = `
              INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) 
              VALUES (?, ?, 'actualización', ?)`;
            db.query(queryNotificacion, [siguiente.ID_usuario, mensaje, eventId], (errNotificacion) => {
              if (errNotificacion) {
                console.error("Error al enviar notificación:", errNotificacion);
              } else {
                console.log(
                  `Notificación enviada por actualización de cola para usuario ${siguiente.ID_usuario}.`
                );
              }
            });
          });
        }
      });
    }

    // Eliminar la inscripción del usuario actual
    const queryEliminarInscripcion = `
      DELETE FROM inscripciones 
      WHERE ID_usuario = ? AND ID_evento = ?`;
    db.query(queryEliminarInscripcion, [userId, eventId], (errEliminar) => {
      if (errEliminar) {
        console.error("Error al eliminar inscripción:", errEliminar);
        return res.status(500).json({
          message: "Ocurrió un error al cancelar tu inscripción.",
          titulo: "Error",
        });
      }

      // Obtener la capacidad actualizada
      const queryCapacidadActual = `
        SELECT COUNT(*) AS inscritos 
        FROM inscripciones 
        WHERE ID_evento = ? AND estado = 'inscrito'`;
      db.query(queryCapacidadActual, [eventId], (errCapacidad, resultCapacidad) => {
        if (errCapacidad) {
          console.error("Error al obtener capacidad actual:", errCapacidad);
          return res.status(500).json({
            message: "Error al procesar la capacidad actual del evento.",
            titulo: "Error",
          });
        }

        const plazasOcupadas = resultCapacidad[0]?.inscritos || 0;
        return res.status(200).json({
          message: "Tu inscripción ha sido cancelada.",
          titulo: "Adiós",
          plazasOcupadas,
        });
      });
    });
  });
});


router.get("/listadoAsistentes/:id", (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  // Consulta para verificar si el usuario es el organizador del evento
  const queryEvento = "SELECT * FROM eventos WHERE ID = ?";
  db.query(queryEvento, [eventId], (errEvento, resultEvento) => {
    if (errEvento) {
      console.error("Error al obtener el evento:", errEvento);
      return res.status(500).send("Error al procesar el evento.");
    }

    if (resultEvento.length === 0) {
      return res.status(404).send("Evento no encontrado.");
    }

    const evento = resultEvento[0];

    // Verificar si el usuario es el organizador
    if (evento.ID_org !== userId) {
      return res.status(403).send("No tienes permisos para ver este listado.");
    }

    // Consulta para obtener los usuarios inscritos
    const queryInscritos = `
      SELECT u.nombre, u.correo, i.fecha
      FROM inscripciones i
      JOIN usuarios u ON i.ID_usuario = u.ID
      WHERE i.ID_evento = ? AND i.estado = 'inscrito'
      ORDER BY i.fecha ASC`;
    db.query(queryInscritos, [eventId], (errInscritos, inscritos) => {
      if (errInscritos) {
        console.error("Error al obtener inscritos:", errInscritos);
        return res.status(500).send("Error al obtener la lista de inscritos.");
      }

      // Consulta para obtener los usuarios en lista de espera
      const queryEspera = `
        SELECT u.nombre, u.correo, i.fecha
        FROM inscripciones i
        JOIN usuarios u ON i.ID_usuario = u.ID
        WHERE i.ID_evento = ? AND i.estado = 'en_espera'
        ORDER BY i.fecha ASC`;
      db.query(queryEspera, [eventId], (errEspera, espera) => {
        if (errEspera) {
          console.error("Error al obtener lista de espera:", errEspera);
          return res
            .status(500)
            .send("Error al obtener la lista de espera.");
        }

        // Formatear fechas y calcular posición en cola para usuarios en espera
        inscritos.forEach((usuario) => {
          usuario.fecha = db.formatearFecha(usuario.fecha);
        });

        espera.forEach((usuario, index) => {
          usuario.fecha = db.formatearFecha(usuario.fecha);
          usuario.posicion = index + 1; // Posición en base al orden
        });

        // Consulta para contar las notificaciones no leídas del usuario
        const queryNoti = `
          SELECT COUNT(*) as hayNotificaciones 
          FROM notificaciones 
          WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
        db.query(queryNoti, [userId], (errNoti, resultNoti) => {
          if (errNoti) {
            console.error("Error al contar notificaciones:", errNoti);
            return res
              .status(500)
              .send("Error al contar las notificaciones.");
          }

          const hayNotificaciones = resultNoti[0]?.hayNotificaciones || 0;

          // Renderizar la vista de listado de asistentes
          res.render("listadoAsistentes", {
            rol: req.session.rol,
            evento,
            inscritos,
            espera,
            totalInscritos: inscritos.length,
            totalEspera: espera.length,
            color: req.session.color,
            font: req.session.font,
            hayNotificaciones,
          });
        });
      });
    });
  });
});


router.post("/actualizar/:id", (req, res) => {
  const {
    título,
    descripción,
    tipo,
    fecha,
    hora,
    duración,
    ubicación,
    facultad,
    capacidad_máxima,
    capacidad_original,
  } = req.body;

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  // Verificar conflictos de horario y ubicación
  const conflictQuery = `
    SELECT *
    FROM eventos
    WHERE TIMESTAMP(fecha, hora) < DATE_ADD(TIMESTAMP(?, ?), INTERVAL ? MINUTE)
      AND DATE_ADD(TIMESTAMP(fecha, hora), INTERVAL duración_minutos MINUTE) > TIMESTAMP(?, ?)
      AND ubicación = ? AND ID_facultad = ? AND ID != ?`;
  const conflictParams = [
    fecha, hora, duración,
    fecha, hora, ubicación,
    facultad, req.params.id,
  ];

  db.query(conflictQuery, conflictParams, (errConflicts, conflicts) => {
    if (errConflicts) {
      console.error("Error al verificar conflictos:", errConflicts);
      return res.status(500).json({ message: "Error al verificar conflictos." });
    }

    if (conflicts.length > 0) {
      return res
        .status(400)
        .json({ message: "Ya existe un evento en el mismo lugar y horario." });
    }

    // Actualizar evento si no hay conflictos
    const updateQuery = `
      UPDATE eventos 
      SET título = ?, descripción = ?, tipo = ?, fecha = ?, hora = ?, duración_minutos = ?, ubicación = ?, ID_facultad = ?, capacidad_máxima = ?
      WHERE ID = ?`;
    const updateParams = [
      título, descripción, tipo, fecha, hora, duración,
      ubicación, facultad, capacidad_máxima, req.params.id,
    ];

    db.query(updateQuery, updateParams, (errUpdate) => {
      if (errUpdate) {
        console.error("Error al actualizar el evento:", errUpdate);
        return res.status(500).json({ message: "Error al actualizar el evento." });
      }

      // Notificar a los usuarios inscritos
      const queryAfectados = `
        SELECT eventos.título, eventos.fecha, inscripciones.ID_usuario
        FROM eventos 
        JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
        WHERE inscripciones.ID_evento = ? AND eventos.fecha > NOW()
        ORDER BY eventos.fecha DESC`;

      db.query(queryAfectados, [req.params.id], (errAfectados, resAfectados) => {
        if (errAfectados) {
          console.error("Error al obtener usuarios afectados:", errAfectados);
          return res.status(500).json({ message: "Error al notificar usuarios." });
        }

        resAfectados.forEach((evento) => {
          evento.fecha = db.formatearFecha(evento.fecha);
          const mensaje = `Atención! El evento "${evento.título}" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!`;

          db.query(
            `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'actualización', ?)`,
            [evento.ID_usuario, mensaje, req.params.id],
            (errNoti) => {
              if (errNoti) {
                console.error("Error al insertar notificación:", errNoti);
              } else {
                console.log(
                  `Notificación programada para usuario ${evento.ID_usuario}.`
                );
              }
            }
          );
        });

        // Comprobar ampliación de aforo
        if (capacidad_máxima > capacidad_original) {
          const querySiguienteEnCola = `
            SELECT ID_usuario 
            FROM inscripciones 
            WHERE ID_evento = ? AND estado = 'en_espera' 
            ORDER BY fecha ASC 
            LIMIT ?`;
          db.query(
            querySiguienteEnCola,
            [req.params.id, capacidad_máxima - capacidad_original],
            (errCola, siguientes) => {
              if (errCola) {
                console.error("Error al obtener lista de espera:", errCola);
                return res.status(500).json({ message: "Error al actualizar cola." });
              }

              if (siguientes.length > 0) {
                const queryActualizarSiguientes = `
                  UPDATE inscripciones 
                  SET estado = 'inscrito'
                  WHERE ID_usuario = ? AND ID_evento = ?`;

                siguientes.forEach((siguiente) => {
                  db.query(
                    queryActualizarSiguientes,
                    [siguiente.ID_usuario, req.params.id],
                    (errUpdateCola) => {
                      if (errUpdateCola) {
                        console.error(
                          `Error al actualizar inscripción para usuario ${siguiente.ID_usuario}:`,
                          errUpdateCola
                        );
                      } else {
                        const mensaje = `El evento "${título}" ha ampliado su aforo y has pasado de la lista de espera a estar inscrito!`;

                        db.query(
                          `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'actualización', ?)`,
                          [siguiente.ID_usuario, mensaje, req.params.id],
                          (errNotiCola) => {
                            if (errNotiCola) {
                              console.error(
                                `Error al notificar usuario ${siguiente.ID_usuario}:`,
                                errNotiCola
                              );
                            } else {
                              console.log(
                                `Notificación programada para usuario ${siguiente.ID_usuario} por ampliación de aforo.`
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                });
              }
            }
          );
        }

        // Devolver éxito si todo sale bien
        return res
          .status(200)
          .json({ message: "Actualización de evento exitosa." });
      });
    });
  });
});


router.post("/cancelarEvento/:id", (req, res) => {
  const eventId = req.params.id;

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  // Desactivar el evento
  const updateQuery = `
    UPDATE eventos 
    SET activo = 0
    WHERE ID = ?`;

  db.query(updateQuery, [eventId], (errUpdate) => {
    if (errUpdate) {
      console.error("Error al desactivar el evento:", errUpdate);
      return res.status(500).json({ message: "Error al cancelar el evento." });
    }

    // Obtener usuarios inscritos al evento
    const queryAfectados = `
      SELECT eventos.título, eventos.fecha, inscripciones.ID_usuario
      FROM eventos 
      JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
      WHERE inscripciones.ID_evento = ? AND eventos.fecha > NOW()
      ORDER BY eventos.fecha DESC`;

    db.query(queryAfectados, [eventId], (errAfectados, resAfectados) => {
      if (errAfectados) {
        console.error("Error al obtener usuarios afectados:", errAfectados);
        return res
          .status(500)
          .json({ message: "Error al notificar a los usuarios." });
      }

      // Notificar a los usuarios
      resAfectados.forEach((evento) => {
        evento.fecha = db.formatearFecha(evento.fecha);
        const mensaje = `Lo lamentamos mucho, pero el evento "${evento.título}" ha sido cancelado.`;

        db.query(
          `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'cancelación', ?)`,
          [evento.ID_usuario, mensaje, eventId],
          (errNoti) => {
            if (errNoti) {
              console.error(
                `Error al insertar notificación para usuario ${evento.ID_usuario}:`,
                errNoti
              );
            } else {
              console.log(
                `Notificación programada para usuario ${evento.ID_usuario}.`
              );
            }
          }
        );
      });

      // Eliminar inscripciones del evento
      const queryEliminarInscripcion = `
        DELETE FROM inscripciones 
        WHERE ID_evento = ?`;

      db.query(queryEliminarInscripcion, [eventId], (errEliminar) => {
        if (errEliminar) {
          console.error("Error al eliminar inscripciones:", errEliminar);
          return res
            .status(500)
            .json({ message: "Error al eliminar inscripciones del evento." });
        }

        // Devolver éxito si todo sale bien
        return res
          .status(200)
          .json({ message: "Cancelación de evento exitosa." });
      });
    });
  });
});


module.exports = router;
