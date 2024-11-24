var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

function formatearFecha(fecha) {
  const fechaObj = new Date(fecha);
  const dia = fechaObj.getDate().toString().padStart(2, '0'); // Día con 2 dígitos
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0'); // Mes (enero es 0, así que sumamos 1)
  const anio = fechaObj.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
  return `${dia}/${mes}/${anio}`;
}

/* GET home page. */
router.get('/', async (req, res) => {

  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect('/login'); 
}

  try{

    //Consulta datos usuario
    const queryUsuario = 'SELECT * FROM usuarios WHERE id = ?';
    const [user] = await db.query(queryUsuario, [req.session.userId]);

    // Verifica si el usuario existe
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }
    else{
      //Consulta nombre facultad
      const queryFacultad = 'SELECT nombre FROM facultades WHERE id = ?';
      const [resfacultad] = await db.query(queryFacultad, [user.ID_facultad]);
      

      //Consulta historial de eventos
      const queryEventosPasados = "SELECT eventos.título, eventos.fecha FROM eventos JOIN inscripciones ON eventos.ID = inscripciones.ID_evento WHERE inscripciones.ID_usuario = ? AND inscripciones.estado = 'inscrito' AND eventos.fecha < NOW() ORDER BY eventos.fecha DESC";
      const resEventos = await db.query(queryEventosPasados, [req.session.userId]);

      resEventos.forEach(evento =>{
        evento.fecha = formatearFecha(evento.fecha);
      })

      res.render('profile', {user: user, facultad: resfacultad, rol: req.session.rol, historial: resEventos});
    }
  
  }catch(error){
    return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
  }

  
});

module.exports = router;