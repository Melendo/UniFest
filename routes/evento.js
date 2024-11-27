"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");

/* GET home page. */
router.get("/evento/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const idEvento = req.params.id;

  try {
    // Consulta del evento
    const queryEvento = "SELECT * FROM eventos WHERE ID = ?";
    const [resEvento] = await db.query(queryEvento, idEvento);
    if (!resEvento) {
      return res.status(400).json({ message: "Evento no encontrado." });
    }

    // Obtenemos la capacidad actual
    const queryCapacidad = `
            SELECT COUNT(*) AS inscritos 
            FROM inscripciones 
            WHERE ID_evento = ? AND estado = 'inscrito'`;
    const [capacidad] = await db.query(queryCapacidad, [idEvento]);
    const capActual = capacidad.inscritos;

    // Formateamos la fecha
    const fechaBD = db.formatearFechaEditar(resEvento.fecha);
    resEvento.fecha = db.formatearFecha(resEvento.fecha);

    // Obtenemos la facultad
    const queryFacultadEvento = "SELECT * FROM facultades WHERE ID = ?";
    const [resFacultad] = await db.query(
      queryFacultadEvento,
      resEvento.ID_facultad
    );

    // Verificar si el usuario está inscrito o en espera
    const queryInscripcion = `
            SELECT estado 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
    const [inscripcion] = await db.query(queryInscripcion, [
      req.session.userId,
      idEvento,
    ]);

    let inscrito = "Inscríbete ya!";
    if (inscripcion?.estado === "inscrito") {
      inscrito = "Cancelar inscripción";
    } else if (inscripcion?.estado === "en_espera") {
      inscrito = "Cancelar espera";
    }

    const queryTodasFacultades = "SELECT * FROM facultades";
    const resTodasFacultades = await db.query(queryTodasFacultades);

    res.render("evento", {
      rol: req.session.rol,
      evento: resEvento,
      facultad: resFacultad,
      id: req.session.userId,
      capActual,
      inscrito,
      fechaBD,
      todasFacultades: resTodasFacultades,
    });
  } catch (error) {
    console.error("Error al cargar el evento:", error);
    return res.status(500).json({ message: "Error al cargar el evento." });
  }
});

router.post("/inscribirse/:id", async (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  if (!userId) {
    return res.redirect("/login");
  }

  try {
    // Verificar si el evento existe y está activo
    const queryEvento =
      "SELECT activo, capacidad_máxima FROM eventos WHERE ID = ?";
    const [evento] = await db.query(queryEvento, [eventId]);

    if (!evento || evento.activo !== 1) {
      return res
        .status(400)
        .json({ message: "El evento no está disponible para inscripciones." });
    }

    // Verificar si el usuario ya está inscrito o en espera
    const queryInscripcion = `
            SELECT * 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
    const [inscripcion] = await db.query(queryInscripcion, [userId, eventId]);

    if (inscripcion) {
      return res
        .status(400)
        .json({ message: "Ya estás inscrito o en la cola para este evento." });
    }

    // Determinar el estado del usuario (inscrito o en espera)
    const queryCapacidadActual = `
            SELECT COUNT(*) AS inscritos 
            FROM inscripciones 
            WHERE ID_evento = ? AND estado = 'inscrito'`;
    const [capacidad] = await db.query(queryCapacidadActual, [eventId]);

    const plazasOcupadas = capacidad.inscritos;
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
    await db.query(queryInscribir, [userId, eventId, estado]);

    return res.status(200).json({ message: mensaje, estado, titulo });
  } catch (error) {
    console.error("Error al inscribirse:", error);
    return res.status(500).json({
      message: "Ocurrió un error al procesar tu inscripción.",
      titulo: "Error",
    });
  }
});

router.post("/cancelar/:id", async (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  if (!userId) {
    return res.redirect("/login");
  }

  try {
    // Verificar si el usuario está inscrito o en espera
    const queryInscripcion = `
            SELECT estado 
            FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
    const [inscripcion] = await db.query(queryInscripcion, [userId, eventId]);

    if (!inscripcion) {
      return res
        .status(400)
        .json({ message: "No tienes una inscripción en este evento." });
    }

    if (inscripcion.estado === "inscrito") {
      // Si está inscrito, buscar al siguiente en la lista de espera con la fecha más antigua
      const querySiguienteEnCola = `
                SELECT ID_usuario 
                FROM inscripciones 
                WHERE ID_evento = ? AND estado = 'en_espera' 
                ORDER BY fecha ASC 
                LIMIT 1`;
      const [siguiente] = await db.query(querySiguienteEnCola, [eventId]);

      if (siguiente) {
        // Actualizar al siguiente como inscrito
        const queryActualizarSiguiente = `
                    UPDATE inscripciones 
                    SET estado = 'inscrito' 
                    WHERE ID_usuario = ? AND ID_evento = ?`;
        await db.query(queryActualizarSiguiente, [
          siguiente.ID_usuario,
          eventId,
        ]);
      }
    }

    // Eliminar la inscripción del usuario actual
    const queryEliminarInscripcion = `
            DELETE FROM inscripciones 
            WHERE ID_usuario = ? AND ID_evento = ?`;
    await db.query(queryEliminarInscripcion, [userId, eventId]);

    return res
      .status(200)
      .json({ message: "Tu inscripción ha sido cancelada.", titulo: "Adiós" });
  } catch (error) {
    console.error("Error al cancelar inscripción:", error);
    return res.status(500).json({
      message: "Ocurrió un error al cancelar tu inscripción.",
      titulo: "Error",
    });
  }
});

router.get("/listadoAsistentes/:id", async (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.id;

  try {
    // Consulta para verificar si el usuario es el organizador del evento
    const queryEvento = "SELECT * FROM eventos WHERE ID = ?";
    const evento = await db.query(queryEvento, [eventId]);

    if (evento.length === 0) {
      return res.status(404).send("Evento no encontrado");
    }

    // Verificar si el usuario es el organizador
    if (evento[0].ID_org !== userId) {
      return res.status(403).send("No tienes permisos para ver este listado");
    }

    // Consulta para obtener los usuarios inscritos
    const queryInscritos = `
            SELECT u.nombre, u.correo, i.fecha
            FROM inscripciones i
            JOIN usuarios u ON i.ID_usuario = u.ID
            WHERE i.ID_evento = ? AND i.estado = 'inscrito'
            ORDER BY i.fecha ASC
        `;
    const inscritos = await db.query(queryInscritos, [eventId]);

    // Consulta para obtener los usuarios en lista de espera
    const queryEspera = `
            SELECT u.nombre, u.correo, i.fecha
            FROM inscripciones i
            JOIN usuarios u ON i.ID_usuario = u.ID
            WHERE i.ID_evento = ? AND i.estado = 'en_espera'
            ORDER BY i.fecha ASC
        `;
    const espera = await db.query(queryEspera, [eventId]);

    // Formatear fechas y calcular posición en cola para usuarios en espera
    inscritos.forEach((usuario) => {
      usuario.fecha = db.formatearFecha(usuario.fecha);
    });

    espera.forEach((usuario, index) => {
      usuario.fecha = db.formatearFecha(usuario.fecha);
      usuario.posicion = index + 1; // Posición en base al orden
    });

    // Renderizar la vista de listado de asistentes
    res.render("listadoAsistentes", {
      rol: req.session.rol,
      evento: evento[0],
      inscritos,
      espera,
      totalInscritos: inscritos.length,
      totalEspera: espera.length,
    });
  } catch (error) {
    console.error("Error al obtener el listado de asistentes:", error);
    res
      .status(500)
      .send("Hubo un error al obtener los datos de los asistentes");
  }
});

router.post("/actualizar/:id", async (req, res) => {
  const {
    título,
    descripción,
    fecha,
    hora,
    duración,
    ubicación,
    facultad,
    capacidad_máxima,
  } = req.body;

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const conflictQuery = `
      SELECT *
      FROM eventos
      WHERE TIMESTAMP(fecha, hora) < DATE_ADD(TIMESTAMP(?, ?), INTERVAL ? MINUTE)
        AND DATE_ADD(TIMESTAMP(fecha, hora), INTERVAL duración_minutos MINUTE) > TIMESTAMP(?, ?)
        AND ubicación = ? AND ID_facultad = ? AND ID != ?
    `;

    const conflictParams = [
      fecha, // Fecha del nuevo evento
      hora, // Hora de inicio del nuevo evento
      duración, // Duración en minutos del nuevo evento
      fecha, // Fecha del nuevo evento
      hora, // Hora de inicio del nuevo evento
      ubicación, // Ubicación del nuevo evento
      facultad,
      req.params.id,
    ];

    const conflicts = await db.query(conflictQuery, conflictParams);

    if (conflicts.length > 0) {
      return res
        .status(400)
        .json({ message: "Ya existe un evento en el mismo lugar y horario." });
    }

    // Si no hay conflictos, insertar el nuevo evento
    const query = `
      UPDATE eventos 
      SET título = ?, descripción = ?, fecha = ?, hora = ?, duración_minutos = ?, ubicación = ?, ID_facultad = ?, capacidad_máxima = ?
      WHERE ID = ?;
    `;
    const params = [
      título,
      descripción,
      fecha,
      hora,
      duración,
      ubicación,
      facultad,
      capacidad_máxima,
      req.params.id,
    ];

    await db.query(query, params);

    // Notificación a los usuarios afectados
    const queryAfectados =
      "SELECT eventos.título, eventos.fecha, inscripciones.ID_usuario FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_evento = ? AND eventos.fecha > NOW() ORDER BY eventos.fecha DESC";
    const resAfectados = await db.query(queryAfectados, [req.params.id]);

    resAfectados.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    for (const evento of resAfectados) {
      const mensaje = `Atención! El evento "${evento.título}" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!`;
      await db.query(
        `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'actualización', ?)`,
        [evento.ID_usuario, mensaje, evento.ID]
      );
      console.log(`Notificación programada por actualización para usuario ${evento.ID_usuario}.`);
    }

    // Si todo es exitoso, devolver éxito
    return res
      .status(200)
      .json({ message: "Actualización de evento exitosa." });
  } catch (error) {
    // Si ocurre un error al hacer la consulta, manejar el error
    console.error("Error al actualizar evento:", error.message, error.sql);
    return res
      .status(500)
      .json({ message: "Error al actualizar el evento. Inténtelo de nuevo." });
  }
});

router.post("/cancelarEvento/:id", async (req, res) => {
  const eventId = req.params.id;

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const query = `
      UPDATE eventos 
      SET activo = 0
      WHERE ID = ?;
    `;

    await db.query(query, [eventId]);

    // Notificación a los usuarios afectados
    const queryAfectados =
      "SELECT eventos.título, eventos.fecha, inscripciones.ID_usuario FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_evento = ? AND eventos.fecha > NOW() ORDER BY eventos.fecha DESC";
    const resAfectados = await db.query(queryAfectados, [req.params.id]);

    resAfectados.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    for (const evento of resAfectados) {
      const mensaje = `Lo lamentamos mucho, pero el evento "${evento.título}" ha sido cancelado.`;
      await db.query(
        `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'cancelación', ?)`,
        [evento.ID_usuario, mensaje, evento.ID]
      );
      console.log(`Notificación programada por cancelación para usuario ${evento.ID_usuario}.`);
    }

    const queryEliminarInscripcion = `
      DELETE FROM inscripciones 
      WHERE ID_evento = ?`;

    await db.query(queryEliminarInscripcion, [eventId]);

    // Si todo es exitoso, devolver éxito
    return res.status(200).json({ message: "Cancelación de evento exitosa." });
  } catch (error) {
    // Si ocurre un error al hacer la consulta, manejar el error
    console.error("Error al cancelar evento:", error.message, error.sql);
    return res
      .status(500)
      .json({ message: "Error al cancelar evento. Inténtelo de nuevo." });
  }
});

module.exports = router;
