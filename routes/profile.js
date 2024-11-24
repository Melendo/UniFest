var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/', async (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirigir al login si no está autenticado
}

  try{
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    const [user] = await db.query(query, [req.session.userId]);
    
    // const queryEventos = 'SELECT * FROM eventos WHERE ID_usuario = ?';
    // const [events] = [];
    // events = await db.query(queryEventos, [16]);

    // Verifica si el usuario existe
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }
    else{
      console.log(user.ID_facultad);
      const query = 'SELECT nombre FROM facultades WHERE id = ?';
      const [resfacultad] = await db.query(query, [user.ID_facultad]);
      res.render('profile', {user: user, facultad: resfacultad});
    }
  
  }catch(error){
    return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
  }

  
});

module.exports = router;