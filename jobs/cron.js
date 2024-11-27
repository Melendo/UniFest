const cron = require("node-cron");
const db = require("../dataBase/db"); // Asegúrate de usar la ruta correcta

const enviarRecordatorios = async () => {
  console.log("Ejecutando tarea: Enviar recordatorios...");

  try {
    // 1. Recordatorios para eventos a 1 día
    const eventosDia1 = await db.query(`
      SELECT e.ID, e.título, e.fecha, u.id AS ID_usuario
      FROM eventos e
      JOIN inscripciones i ON e.ID = i.ID_evento
      JOIN usuarios u ON i.ID_usuario = u.ID
      WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      UNION
      SELECT e.ID, e.título, e.fecha, o.ID AS ID_usuario
      FROM eventos e
      JOIN usuarios o ON e.ID_org = o.ID
      WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL 1 DAY);
    `);

    eventosDia1.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    for (const evento of eventosDia1) {
      const mensaje = `¡Recuerda! El evento "${evento.título}" es mañana, el ${evento.fecha}.`;
      await db.query(
        `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'recordatorio', ?)`,
        [evento.ID_usuario, mensaje, evento.ID]
      );
      console.log(
        `Notificación programada (1 día antes) para usuario ${evento.ID_usuario}.`
      );
    }

    // 2. Recordatorios para eventos a 3 días
    const eventosDia3 = await db.query(`
      SELECT e.ID, e.título, e.fecha, u.id AS ID_usuario
      FROM eventos e
      JOIN inscripciones i ON e.ID = i.ID_evento
      JOIN usuarios u ON i.ID_usuario = u.ID
      WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
      UNION
      SELECT e.ID, e.título, e.fecha, o.ID AS ID_usuario
      FROM eventos e
      JOIN usuarios o ON e.ID_org = o.ID
      WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL 3 DAY);
    `);

    eventosDia3.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    for (const evento of eventosDia3) {
      const mensaje = `¡Falta poco! El evento "${evento.título}" será en 3 días, el ${evento.fecha}.`;
      await db.query(
        `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'recordatorio', ?)`,
        [evento.ID_usuario, mensaje, evento.ID]
      );
      console.log(
        `Notificación programada (3 días antes) para usuario ${evento.ID_usuario}.`
      );
    }

    // 3. Recordatorios para eventos a 7 días
    const eventosDia7 = await db.query(`
      SELECT e.ID, e.título, e.fecha, u.id AS ID_usuario
      FROM eventos e
      JOIN inscripciones i ON e.ID = i.ID_evento
      JOIN usuarios u ON i.ID_usuario = u.ID
      WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      UNION
      SELECT e.ID, e.título, e.fecha, o.ID AS ID_usuario
      FROM eventos e
      JOIN usuarios o ON e.ID_org = o.ID
      WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    `);

    eventosDia7.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    for (const evento of eventosDia7) {
      const mensaje = `Planifica con tiempo: El evento "${evento.título}" será en 7 días, el ${evento.fecha}.`;
      await db.query(
        `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'recordatorio', ?)`,
        [evento.ID_usuario, mensaje, evento.ID]
      );
      console.log(
        `Notificación programada (7 días antes) para usuario ${evento.ID_usuario}.`
      );
    }
  } catch (error) {
    console.error("Error al enviar recordatorios:", error.message);
  }
};

const limpiarNotificacionesAntiguas = async () => {
  console.log("Ejecutando tarea: Limpieza de notificaciones antiguas...");

  try {
    const resultado = await db.query(
      `UPDATE notificaciones SET activo = 0 WHERE fecha <  DATE_ADD(CURDATE(), INTERVAL 14 DAY)`
    );
    console.log(
      `Limpieza completada. Filas eliminadas: ${resultado.affectedRows}`
    );
  } catch (error) {
    console.error("Error al limpiar notificaciones antiguas:", error.message);
  }
};

cron.schedule("0 11 * * *", limpiarNotificacionesAntiguas);
cron.schedule("10 18 * * *", enviarRecordatorios);

console.log("Tareas cron configuradas.");
