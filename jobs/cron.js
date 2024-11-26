const cron = require("node-cron");
const db = require("../dataBase/db"); // Asegúrate de usar la ruta correcta

const enviarRecordatorios = async () => {
  console.log("Ejecutando tarea: Enviar recordatorios...");

  try {
    const query = `
    SELECT e.ID, e.título, e.fecha, u.id AS ID_usuario
    FROM eventos e
    JOIN inscripciones i ON e.ID = i.ID_evento
    JOIN usuarios u ON i.ID_usuario = u.ID
    WHERE DATE(e.fecha) IN (
      DATE_ADD(CURDATE(), INTERVAL 1 DAY),
      DATE_ADD(CURDATE(), INTERVAL 3 DAY),
      DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
    )
    `;

    const eventos = await db.query(query);

    for (const evento of eventos) {
      const mensaje = `Recordatorio: El evento "${evento.título}" será el ${evento.fecha}`;
      await db.query(
        `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'recordatorio', ?)`,
        [evento.ID_usuario, mensaje, evento.ID]
      );

      console.log(`Notificación programada para el usuario ${evento.ID_usuario} sobre el evento "${evento.título}".`);
    }
  } catch (error) {
    console.error("Error al enviar recordatorios:", error.message);
  }
};

const limpiarNotificacionesAntiguas = async () => {
  console.log("Ejecutando tarea: Limpieza de notificaciones antiguas...");

  try {
    const resultado = await db.query(`DELETE FROM notificaciones WHERE fecha < CURDATE()`);
    console.log(`Limpieza completada. Filas eliminadas: ${resultado.affectedRows}`);
  } catch (error) {
    console.error("Error al limpiar notificaciones antiguas:", error.message);
  }
};

cron.schedule("0 0 * * *", enviarRecordatorios);
cron.schedule("0 1 * * *", limpiarNotificacionesAntiguas);

console.log("Tareas cron configuradas.");