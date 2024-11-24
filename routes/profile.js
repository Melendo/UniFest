var express = require('express');
var router = express.Router();
var db = require('../dataBase/db');

/* GET home page. */
router.get('/', async (req, res) => {

  try{
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    const [user] = await db.query(query, [16]);
    
    // const queryEventos = 'SELECT * FROM eventos WHERE ID_usuario = ?';
    // const [events] = [];
    // events = await db.query(queryEventos, [16]);

    // Verifica si el usuario existe
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }
    else res.render('profile', {user: user});
  
  }catch(error){
    return res.status(500).json({ message: 'Hubo un error al procesar la solicitud. Intenta de nuevo.' });
  }

  
});

module.exports = router;