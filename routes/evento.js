"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

router.get("/evento/:id", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const idEvento = req.params.id;

  //Consulta del evento
  const queryEvento = "SELECT * FROM eventos WHERE ID = ?";
  db.query(queryEvento, [idEvento], (errEvento, resultEvento) => {
    if (errEvento) {
      console.log("Error al consultar el evento:", errEvento);
      return res.status(500).json({ message: "Error al cargar el evento." });
    }
    const resEvento = resultEvento[0];
    if (!resEvento) {
      return res.status(400).json({ message: "Evento no encontrado." });
    }

    //Obtenemos la capacidad actual
    const queryCapacidad = `
      SELECT COUNT(*) AS inscritos 
      FROM inscripciones 
      WHERE ID_evento = ? AND estado = 'inscrito' AND activo = 1`;
    db.query(queryCapacidad, [idEvento], (errCapacidad, resultCapacidad) => {
      if (errCapacidad) {
        console.log("Error al obtener la capacidad actual:", errCapacidad);
        return res.status(500).json({ message: "Error al cargar el evento." });
      }
      const capActual = resultCapacidad[0].inscritos;

      //Formateamos la fecha
      const fechaBD = db.formatearFechaEditar(resEvento.fecha);
      resEvento.fecha = db.formatearFecha(resEvento.fecha);

      //Obtenemos la facultad
      const queryFacultadEvento = "SELECT * FROM facultades WHERE ID = ?";
      db.query(
        queryFacultadEvento,
        [resEvento.ID_facultad],
        (errFacultad, resultFacultad) => {
          if (errFacultad) {
            console.log("Error al obtener la facultad:", errFacultad);
            return res
              .status(500)
              .json({ message: "Error al cargar el evento." });
          }
          const resFacultad = resultFacultad[0];

          //Verificamos si el usuario está inscrito o en espera
          const queryInscripcion = `
            SELECT estado 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ? AND activo = 1`;
          db.query(
            queryInscripcion,
            [req.session.userId, idEvento],
            (errInscripcion, resultInscripcion) => {
              if (errInscripcion) {
                console.log(
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

              //Obtenermos todas las facultades
              const queryTodasFacultades = "SELECT * FROM facultades";
              db.query(
                queryTodasFacultades,
                (errFacultades, resultFacultades) => {
                  if (errFacultades) {
                    console.log(
                      "Error al obtener las facultades:",
                      errFacultades
                    );
                    return res
                      .status(500)
                      .json({ message: "Error al cargar el evento." });
                  }

                  //Vemos si hay notificaciones sin leer
                  const queryNoti = `
                  SELECT COUNT(*) as hayNotificaciones 
                  FROM notificaciones 
                  WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
                  db.query(
                    queryNoti,
                    [req.session.userId],
                    (errNoti, resultNoti) => {
                      if (errNoti) {
                        console.log(
                          "Error al contar notificaciones no leídas:",
                          errNoti
                        );
                        return res
                          .status(500)
                          .json({ message: "Error al cargar el evento." });
                      }
                      const hayNotificaciones = resultNoti[0].hayNotificaciones;

                      //Renderizamos la pagina del evento
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
                    }
                  );
                }
              );
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

  //Verificamos si el evento existe y está activo
  const queryEvento =
    "SELECT activo, capacidad_máxima FROM eventos WHERE ID = ?";
  db.query(queryEvento, [eventId], (errEvento, resultEvento) => {
    if (errEvento) {
      console.log("Error al verificar el evento:", errEvento);
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

    //Verificamos las inscripciones activas e inactivas del usuario
    const queryInscripcion = `
      SELECT * 
      FROM inscripciones 
      WHERE ID_usuario = ? AND ID_evento = ?`;
    db.query(
      queryInscripcion,
      [userId, eventId],
      (errInscripcion, resultInscripcion) => {
        if (errInscripcion) {
          console.log("Error al verificar inscripción:", errInscripcion);
          return res.status(500).json({
            message: "Error al verificar tu inscripción. Intenta de nuevo.",
            titulo: "Error",
          });
        }

        //Comprobamos la capacidad actual del evento
        const queryCapacidadActual = `
        SELECT COUNT(*) AS inscritos 
        FROM inscripciones 
        WHERE ID_evento = ? AND estado = 'inscrito' AND activo = 1`;

        db.query(
          queryCapacidadActual,
          [eventId],
          (errCapacidad, resultCapacidad) => {
            if (errCapacidad) {
              console.log("Error al obtener capacidad actual:", errCapacidad);
              return res.status(500).json({
                message: "Error al verificar la capacidad del evento.",
                titulo: "Error",
              });
            }

            const plazasOcupadas = resultCapacidad[0].inscritos;
            const capacidadMaxima = evento.capacidad_máxima;

            //Comprobamos si hay plazas disponibles
            if (plazasOcupadas < capacidadMaxima) {

              //Si el usuario tiene inscripción inactiva, reactivamos la inscripción
              if (resultInscripcion.length > 0 && resultInscripcion[0].activo === 0) {
                const queryActualizarInscripcion = `
              UPDATE inscripciones 
              SET activo = 1 
              WHERE ID_usuario = ? AND ID_evento = ?`;

                db.query(
                  queryActualizarInscripcion,
                  [userId, eventId],
                  (errActualizar) => {
                    if (errActualizar) {
                      console.log("Error al actualizar la inscripción:", errActualizar);
                      return res.status(500).json({
                        message:
                          "Error al reactivar tu inscripción. Intenta de nuevo.",
                        titulo: "Error",
                      });
                    }
                    return res.status(200).json({
                      message: "Tu inscripción ha sido reactivada con éxito.",
                      estado: "inscrito",
                      titulo: "Felicidades",
                      plazasOcupadas,
                    });
                  }
                );
              } else {

                // Si el usuario no tiene inscripción, lo insertamos como inscrito
                const queryInscribir = `
              INSERT INTO inscripciones (ID_usuario, ID_evento, estado, fecha) 
              VALUES (?, ?, 'inscrito', NOW())`;

                db.query(queryInscribir, [userId, eventId], (errInscribir) => {
                  if (errInscribir) {
                    console.log(
                      "Error al registrar la inscripción:",
                      errInscribir
                    );
                    return res.status(500).json({
                      message: "Ocurrió un error al procesar tu inscripción.",
                      titulo: "Error",
                    });
                  }

                  return res.status(200).json({
                    message: "¡Inscripción completada con éxito!",
                    estado: "inscrito",
                    titulo: "Felicidades",
                    plazasOcupadas,
                  });
                });
              }
            } else {

              //Si no hay plazas disponibles, añadimos a la lista de espera
              if (resultInscripcion.length === 0) {
                const queryInscribirEspera = `
              INSERT INTO inscripciones (ID_usuario, ID_evento, estado, fecha) 
              VALUES (?, ?, 'en_espera', NOW())`;

                db.query(
                  queryInscribirEspera,
                  [userId, eventId],
                  (errInscribirEspera) => {
                    if (errInscribirEspera) {
                      console.log(
                        "Error al añadir a la lista de espera:",
                        errInscribirEspera
                      );
                      return res.status(500).json({
                        message:
                          "Ocurrió un error al añadirse a la lista de espera.",
                        titulo: "Error",
                      });
                    }

                    return res.status(200).json({
                      message:
                        "El evento está lleno, pero te hemos puesto en la lista de espera.",
                      estado: "en_espera",
                      titulo: "En lista de espera",
                      plazasOcupadas,
                    });
                  }
                );
                //Si no hay plazas pero la inscripción está inactiva, reactivamos asegurando el estado espera
              } else if (resultInscripcion[0].activo === 0) {
                const queryActualizarInscripcion = `
              UPDATE inscripciones 
              SET activo = 1 AND estado = 'en_espera'
              WHERE ID_usuario = ? AND ID_evento = ?`;

                db.query(
                  queryActualizarInscripcion,
                  [userId, eventId],
                  (errActualizar) => {
                    if (errActualizar) {
                      console.log(
                        "Error al actualizar la inscripción:",
                        errActualizar
                      );
                      return res.status(500).json({
                        message:
                          "Error al reactivar tu inscripción. Intenta de nuevo.",
                        titulo: "Error",
                      });
                    }
                    return res.status(200).json({
                      message: "Tu espera ha sido reactivada con éxito.",
                      estado: "inscrito",
                      titulo: "Felicidades",
                      plazasOcupadas,
                    });
                  }
                );
              } else {
                //Si ya está inscrito o en espera, no se hace nada
                return res.status(400).json({
                  message:
                    "Ya estás inscrito o en la lista de espera para este evento.",
                  titulo: "Error",
                });
              }
            }
          }
        );
      }
    );
  });
});

router.post("/cancelar/:id", (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  if (!userId) {
    return res.redirect("/login");
  }

  //Comprobamos si el usuario está inscrito o en espera
  const queryInscripcion = `
    SELECT estado 
    FROM inscripciones 
    WHERE ID_usuario = ? AND ID_evento = ?  AND activo = 1`;
  db.query(
    queryInscripcion,
    [userId, eventId],
    (errInscripcion, resultInscripcion) => {
      if (errInscripcion) {
        console.log("Error al verificar inscripción:", errInscripcion);
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

        //Buscamos al siguiente en la lista de espera
        const querySiguienteEnCola = `
        SELECT ID_usuario 
        FROM inscripciones 
        WHERE ID_evento = ? AND estado = 'en_espera' AND activo = 1
        ORDER BY fecha ASC 
        LIMIT 1`;
        db.query(querySiguienteEnCola, [eventId], (errCola, resultCola) => {
          if (errCola) {
            console.log("Error al obtener siguiente en cola:", errCola);
            return res.status(500).json({
              message: "Error al procesar la lista de espera.",
              titulo: "Error",
            });
          }

          const siguiente = resultCola[0];
          if (siguiente) {
            //Actualizamos el estado del siguiente como inscrito
            const queryActualizarSiguiente = `
            UPDATE inscripciones 
            SET estado = 'inscrito' 
            WHERE ID_usuario = ? AND ID_evento = ?`;
            db.query(
              queryActualizarSiguiente,
              [siguiente.ID_usuario, eventId],
              (errActualizar) => {
                if (errActualizar) {
                  console.log(
                    "Error al actualizar estado del siguiente:",
                    errActualizar
                  );
                  return res.status(500).json({
                    message:
                      "Error al actualizar la inscripción del siguiente en la lista.",
                    titulo: "Error",
                  });
                }

                const mensaje = `Alguien ha cancelado su inscripción del evento ${eventId} y has pasado de la lista de espera a estar inscrito!`;

                //Notificamos al usuario actualizado
                const queryNotificacion = `
              INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) 
              VALUES (?, ?, 'actualización', ?)`;
                db.query(
                  queryNotificacion,
                  [siguiente.ID_usuario, mensaje, eventId],
                  (errNotificacion) => {
                    if (errNotificacion) {
                      console.log(
                        "Error al enviar notificación:",
                        errNotificacion
                      );
                    } else {
                      console.log(
                        `Notificación enviada por actualización de cola para usuario ${siguiente.ID_usuario}.`
                      );
                    }
                  }
                );
              }
            );
          }
        });
      }

      //Eliminamos la inscripción del usuario actual
      const queryEliminarInscripcion = `
      UPDATE inscripciones 
            SET activo = 0 
            WHERE ID_usuario = ? AND ID_evento = ?`;
      db.query(queryEliminarInscripcion, [userId, eventId], (errEliminar) => {
        if (errEliminar) {
          console.log("Error al eliminar inscripción:", errEliminar);
          return res.status(500).json({
            message: "Ocurrió un error al cancelar tu inscripción.",
            titulo: "Error",
          });
        }

        //Obtenemos la capacidad actualizada
        const queryCapacidadActual = `
        SELECT COUNT(*) AS inscritos 
        FROM inscripciones 
        WHERE ID_evento = ? AND estado = 'inscrito'  AND activo = 1`;
        db.query(
          queryCapacidadActual,
          [eventId],
          (errCapacidad, resultCapacidad) => {
            if (errCapacidad) {
              console.log("Error al obtener capacidad actual:", errCapacidad);
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
          }
        );
      });
    }
  );
});

router.get("/listadoAsistentes/:id", (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  //Obtenemos el evento
  const queryEvento = "SELECT * FROM eventos WHERE ID = ?";
  db.query(queryEvento, [eventId], (errEvento, resultEvento) => {
    if (errEvento) {
      console.log("Error al obtener el evento:", errEvento);
      return res.status(500).send("Error al procesar el evento.");
    }

    if (resultEvento.length === 0) {
      return res.status(404).send("Evento no encontrado.");
    }

    const evento = resultEvento[0];

    //Comprobamos si el usuario es el organizador del evento
    if (evento.ID_org !== userId) {
      return res.status(403).send("No tienes permisos para ver este listado.");
    }

    //Obtenemos los usuarios inscritos
    const queryInscritos = `
      SELECT u.nombre, u.correo, i.fecha
      FROM inscripciones i
      JOIN usuarios u ON i.ID_usuario = u.ID
      WHERE i.ID_evento = ? AND i.estado = 'inscrito' AND i.activo = 1
      ORDER BY i.fecha ASC`;
    db.query(queryInscritos, [eventId], (errInscritos, inscritos) => {
      if (errInscritos) {
        console.log("Error al obtener inscritos:", errInscritos);
        return res.status(500).send("Error al obtener la lista de inscritos.");
      }

      //Obtenemos los usuarios en lista de espera
      const queryEspera = `
        SELECT u.nombre, u.correo, i.fecha
        FROM inscripciones i
        JOIN usuarios u ON i.ID_usuario = u.ID
        WHERE i.ID_evento = ? AND i.estado = 'en_espera' AND i.activo = 1
        ORDER BY i.fecha ASC`;
      db.query(queryEspera, [eventId], (errEspera, espera) => {
        if (errEspera) {
          console.log("Error al obtener lista de espera:", errEspera);
          return res.status(500).send("Error al obtener la lista de espera.");
        }

        inscritos.forEach((usuario) => {
          usuario.fecha = db.formatearFecha(usuario.fecha);
        });

        espera.forEach((usuario, index) => {
          usuario.fecha = db.formatearFecha(usuario.fecha);
          usuario.posicion = index + 1; // Posición en base al orden
        });

        //Comprobamos si hay notificaciones sin leer
        const queryNoti = `
          SELECT COUNT(*) as hayNotificaciones 
          FROM notificaciones 
          WHERE leido = 0 AND activo = 1 AND ID_usuario = ?`;
        db.query(queryNoti, [userId], (errNoti, resultNoti) => {
          if (errNoti) {
            console.log("Error al contar notificaciones:", errNoti);
            return res.status(500).send("Error al contar las notificaciones.");
          }

          const hayNotificaciones = resultNoti[0]?.hayNotificaciones || 0;

          //Renderizamos la vista de listado de asistentes
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

  //Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  //Comprobamos conflictos entre eventos
  const conflictQuery = `
    SELECT *
    FROM eventos
    WHERE TIMESTAMP(fecha, hora) < DATE_ADD(TIMESTAMP(?, ?), INTERVAL ? MINUTE)
      AND DATE_ADD(TIMESTAMP(fecha, hora), INTERVAL duración_minutos MINUTE) > TIMESTAMP(?, ?)
      AND ubicación = ? AND ID_facultad = ? AND ID != ?`;
  const conflictParams = [
    fecha,
    hora,
    duración,
    fecha,
    hora,
    ubicación,
    facultad,
    req.params.id,
  ];

  db.query(conflictQuery, conflictParams, (errConflicts, conflicts) => {
    if (errConflicts) {
      console.log("Error al verificar conflictos:", errConflicts);
      return res
        .status(500)
        .json({ message: "Error al verificar conflictos." });
    }

    if (conflicts.length > 0) {
      return res
        .status(400)
        .json({ message: "Ya existe un evento en el mismo lugar y horario." });
    }

    //Actualizamos el evento si no hay conflictos
    const updateQuery = `
      UPDATE eventos 
      SET título = ?, descripción = ?, tipo = ?, fecha = ?, hora = ?, duración_minutos = ?, ubicación = ?, ID_facultad = ?, capacidad_máxima = ?
      WHERE ID = ?`;
    const updateParams = [
      título,
      descripción,
      tipo,
      fecha,
      hora,
      duración,
      ubicación,
      facultad,
      capacidad_máxima,
      req.params.id,
    ];

    db.query(updateQuery, updateParams, (errUpdate) => {
      if (errUpdate) {
        console.log("Error al actualizar el evento:", errUpdate);
        return res
          .status(500)
          .json({ message: "Error al actualizar el evento." });
      }

      //Notificamos a los usuarios inscritos
      const queryAfectados = `
        SELECT eventos.título, eventos.fecha, inscripciones.ID_usuario
        FROM eventos 
        JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
        WHERE inscripciones.ID_evento = ? AND eventos.fecha > NOW() AND inscripciones.activo = 1
        ORDER BY eventos.fecha DESC`;

      db.query(
        queryAfectados,
        [req.params.id],
        (errAfectados, resAfectados) => {
          if (errAfectados) {
            console.log("Error al obtener usuarios afectados:", errAfectados);
            return res
              .status(500)
              .json({ message: "Error al notificar usuarios." });
          }

          resAfectados.forEach((evento) => {
            evento.fecha = db.formatearFecha(evento.fecha);
            const mensaje = `Atención! El evento "${evento.título}" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!`;

            db.query(
              `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'actualización', ?)`,
              [evento.ID_usuario, mensaje, req.params.id],
              (errNoti) => {
                if (errNoti) {
                  console.log("Error al insertar notificación:", errNoti);
                } else {
                  console.log(
                    `Notificación programada para usuario ${evento.ID_usuario}.`
                  );
                }
              }
            );
          });

          //Si hay ampliación de aforo
          if (capacidad_máxima > capacidad_original) {
            const querySiguienteEnCola = `
            SELECT ID_usuario 
            FROM inscripciones 
            WHERE ID_evento = ? AND estado = 'en_espera' AND activo = 1
            ORDER BY fecha ASC 
            LIMIT ?`;
            db.query(
              querySiguienteEnCola,
              [req.params.id, capacidad_máxima - capacidad_original],
              (errCola, siguientes) => {
                if (errCola) {
                  console.log("Error al obtener lista de espera:", errCola);
                  return res
                    .status(500)
                    .json({ message: "Error al actualizar cola." });
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
                          console.log(
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
                                console.log(
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

          return res
            .status(200)
            .json({ message: "Actualización de evento exitosa." });
        }
      );
    });
  });
});

router.post("/cancelarEvento/:id", (req, res) => {
  const eventId = req.params.id;

  //Comprobamos si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  //Eliminamos el evento
  const updateQuery = `
    UPDATE eventos 
    SET activo = 0
    WHERE ID = ?`;

  db.query(updateQuery, [eventId], (errUpdate) => {
    if (errUpdate) {
      console.log("Error al desactivar el evento:", errUpdate);
      return res.status(500).json({ message: "Error al cancelar el evento." });
    }

    //Obtenemos los usuarios inscritos al evento
    const queryAfectados = `
      SELECT eventos.título, eventos.fecha, inscripciones.ID_usuario
      FROM eventos 
      JOIN inscripciones ON eventos.ID = inscripciones.ID_evento
      WHERE inscripciones.ID_evento = ? AND eventos.fecha > NOW() AND inscripciones.activo = 1
      ORDER BY eventos.fecha DESC`;

    db.query(queryAfectados, [eventId], (errAfectados, resAfectados) => {
      if (errAfectados) {
        console.log("Error al obtener usuarios afectados:", errAfectados);
        return res
          .status(500)
          .json({ message: "Error al notificar a los usuarios." });
      }

      //Notificamos a los usuarios
      resAfectados.forEach((evento) => {
        evento.fecha = db.formatearFecha(evento.fecha);
        const mensaje = `Lo lamentamos mucho, pero el evento "${evento.título}" ha sido cancelado.`;

        db.query(
          `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'cancelación', ?)`,
          [evento.ID_usuario, mensaje, eventId],
          (errNoti) => {
            if (errNoti) {
              console.log(
                `Error al insertar notificación para usuario ${evento.ID_usuario}:`,
                errNoti
              );
            } else {
              console.log(
                `Notificación enviada por cancelación para usuario ${evento.ID_usuario}.`
              );
            }
          }
        );
      });

      //Eliminamos las inscripciones del evento
      const queryEliminarInscripcion = `
        UPDATE inscripciones 
            SET activo = 0 
            WHERE ID_evento = ?`;

      db.query(queryEliminarInscripcion, [eventId], (errEliminar) => {
        if (errEliminar) {
          console.log("Error al eliminar inscripciones:", errEliminar);
          return res
            .status(500)
            .json({ message: "Error al eliminar inscripciones del evento." });
        }

        return res
          .status(200)
          .json({ message: "Cancelación de evento exitosa." });
      });
    });
  });
});

module.exports = router;
