const cron = require("node-cron");
const db = require("../dataBase/db");

const enviarNotificaciones = async (eventos, mensaje) => {
  try {
    for (const evento of eventos) {
      const notificacion = mensaje.replace("{título}", evento.título).replace("{fecha}", evento.fecha);

      await new Promise((resolve, reject) => {
        const queryNoti = "INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'recordatorio', ?)";
        db.query(queryNoti, [evento.ID_usuario, notificacion, evento.ID], (errNoti) => {
            if (errNoti) {
              console.log(`Error al programar notificación para usuario ${evento.ID_usuario}:`, errNoti);
              reject(errNoti);
            } else {
              console.log(`Notificación programada para usuario ${evento.ID_usuario}.`);
              resolve();
            }
          }
        );
      });
    }
  } catch (err) {
    console.log("Error en el envío de notificaciones:", err);
  }
};

const procesarEventos = (dias, mensaje) => {
  const queryEventos = `
    SELECT e.ID, e.título, e.fecha, u.id AS ID_usuario
    FROM eventos e
    JOIN inscripciones i ON e.ID = i.ID_evento
    JOIN usuarios u ON i.ID_usuario = u.ID
    WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL ? DAY) AND i.activo = 1
    UNION
    SELECT e.ID, e.título, e.fecha, o.ID AS ID_usuario
    FROM eventos e
    JOIN usuarios o ON e.ID_org = o.ID
    WHERE DATE(e.fecha) = DATE_ADD(CURDATE(), INTERVAL ? DAY);
  `;

  db.query(queryEventos, [dias, dias], (errEventos, eventos) => {
    if (errEventos) {
      console.log("Error al obtener eventos:", errEventos);
      return -1;
    }

    eventos.forEach((evento) => {
      evento.fecha = db.formatearFecha(evento.fecha);
    });

    enviarNotificaciones(eventos, mensaje);
  });
};

const enviarRecordatorios = () => {
  console.log("Ejecutando tarea: Enviar recordatorios...");

  // Enviar recordatorios a 1 día
  procesarEventos(1, '¡Recuerda! El evento "{título}" es mañana, el {fecha}.');

  // Enviar recordatorios a 3 días
  procesarEventos(3,'¡Falta poco! El evento "{título}" será en 3 días, el {fecha}.');

  // Enviar recordatorios a 7 días
  procesarEventos(7,'Planifica con tiempo: El evento "{título}" será en 7 días, el {fecha}.');
};

const limpiarNotificacionesAntiguas = () => {
  console.log("Ejecutando tarea: Limpieza de notificaciones antiguas...");

  const query = `
    UPDATE notificaciones 
    SET activo = 0 
    WHERE fecha < DATE_SUB(CURDATE(), INTERVAL 14 DAY)
  `;

  db.query(query, (err) => {
    if (err) {
      console.log("Error al limpiar notificaciones antiguas:", err.message);
      return -1;
    }

    console.log(
      "Limpieza completada. Filas eliminadas: ${resultado.affectedRows}"
    );
  });
};

cron.schedule("30 22 * * *", limpiarNotificacionesAntiguas);
cron.schedule("11 23 * * *", enviarRecordatorios);
