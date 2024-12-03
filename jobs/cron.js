const cron = require("node-cron");
const db = require("../dataBase/db");

const enviarRecordatorios = () => {
  console.log("Ejecutando tarea: Enviar recordatorios...");

  const procesarEventos = (dias, mensajePlantilla) => {
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
        console.error(`Error al obtener eventos a ${dias} días:`, errEventos);
        return;
      }

      eventos.forEach((evento) => {
        evento.fecha = db.formatearFecha(evento.fecha);
      });

      // Usar un for...of para manejar las consultas de manera secuencial
      const procesarNotificaciones = async () => {
        for (const evento of eventos) {
          const mensaje = mensajePlantilla.replace("{título}", evento.título).replace("{fecha}", evento.fecha);

          // Incluir la consulta dentro de la secuencia para que espere a que termine antes de pasar al siguiente
          await new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO notificaciones (ID_usuario, mensaje, tipo, ID_evento) VALUES (?, ?, 'recordatorio', ?)`,
              [evento.ID_usuario, mensaje, evento.ID],
              (errNoti) => {
                if (errNoti) {
                  console.error(`Error al programar notificación para usuario ${evento.ID_usuario}:`, errNoti);
                  reject(errNoti); // Rechazar si hay un error
                } else {
                  console.log(`Notificación programada (${dias} días antes) para usuario ${evento.ID_usuario}.`);
                  resolve(); // Resolver cuando la consulta se complete correctamente
                }
              }
            );
          });
        }
      };

      // Ejecutar la función que procesará las notificaciones secuencialmente
      procesarNotificaciones().catch((err) => console.error('Error en el procesamiento de notificaciones:', err));
    });
  };

  // Enviar recordatorios a 1 día
  procesarEventos(1, "¡Recuerda! El evento \"{título}\" es mañana, el {fecha}.");

  // Enviar recordatorios a 3 días
  procesarEventos(3, "¡Falta poco! El evento \"{título}\" será en 3 días, el {fecha}.");

  // Enviar recordatorios a 7 días
  procesarEventos(7, "Planifica con tiempo: El evento \"{título}\" será en 7 días, el {fecha}.");
};


const limpiarNotificacionesAntiguas = () => {
  console.log("Ejecutando tarea: Limpieza de notificaciones antiguas...");

  const query = `
    UPDATE notificaciones 
    SET activo = 0 
    WHERE fecha < DATE_SUB(CURDATE(), INTERVAL 14 DAY)
  `;

  db.query(query, (err, resultado) => {
    if (err) {
      console.error("Error al limpiar notificaciones antiguas:", err.message);
      return -1;
    }

    console.log(
      `Limpieza completada. Filas eliminadas: ${resultado.affectedRows}`
    );
  });
};


cron.schedule("30 22 * * *", limpiarNotificacionesAntiguas);
cron.schedule("28 22 * * *", enviarRecordatorios);

console.log("Tareas cron configuradas.");
