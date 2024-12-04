"use strict";
var express = require("express");
var router = express.Router();
var db = require("../dataBase/db");
var bcrypt = require("bcrypt");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

//Carga la página login
router.get("/", function (req, res) {
  res.render("login");
});

router.post("/login", (req, res) => {
  //Obtención de datos
  const { correo, contraseña } = req.body;
  
  //Comprobamos si el correo existe
  const query = "SELECT * FROM usuarios WHERE correo = ?";
  db.query(query, [correo], (err, user) => {
    if (err) {
      console.log("Error al consultar el correo:", err);
      return res
      .status(500)
      .json({
        message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
      });
    }
    
    //Comprobamos si el usuario existe
    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }
    
    //Comprobamos la contraseña
    bcrypt.compare(contraseña, user[0].contrasenia, (err, isPasswordValid) => {
      if (err) {
        console.log("Error al comparar la contraseña:", err);
        return res
        .status(500)
        .json({
          message: "Hubo un error al procesar la contraseña. Intenta de nuevo.",
        });
      }
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Contraseña incorrecta." });
      }
      
      //Si las credenciales son correctas, guardamos la sesión
      req.session.userId = user[0].ID; 
      req.session.nombre = user[0].nombre; 
      req.session.rol = user[0].organizador; 
      
      //Comprobamos si hay configuración de accesibilidad
      const queryConf = "SELECT * FROM conf_accesibilidad WHERE ID_usuario = ?";
      db.query(queryConf, [req.session.userId], (err, resConf) => {
        if (err) {
          console.log("Error al consultar la configuración de accesibilidad:", err);
          return res
          .status(500)
          .json({
            message: "Hubo un error al procesar la configuración. Intenta de nuevo.",
          });
        }
        
        if (!resConf || resConf.length === 0) {
          //Si no existe la configuración, la generamos
          const confQuery = "INSERT INTO conf_accesibilidad (ID_usuario) VALUES (?)";
          db.query(confQuery, [req.session.userId], (err) => {
            if (err) {
              console.log("Error al insertar configuración de accesibilidad:", err);
              return res
              .status(500)
              .json({
                message: "Hubo un error al insertar la configuración.",
              });
            }
            
            req.session.color = 'claro';
            req.session.font = 'normal';

            return res
            .status(200)
            .json({ message: "Inicio de sesión exitoso", redirect: "/dashboard" });
          });
        } else {
          //Añadimos la configuración de accesibilidad a la sesión
          req.session.color = resConf[0].colores;
          req.session.font = resConf[0].t_size;
          
          return res
          .status(200)
          .json({ message: "Inicio de sesión exitoso", redirect: "/dashboard" });
        }
      });
    });
  });
});


router.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al cerrar sesión:", err);
      return res.status(500).send("No se pudo cerrar sesión");
    }
    res.redirect("/login"); // Redirige al login tras cerrar sesión
  });
});


router.post("/recuperar", async (req, res) => {
  
  const { correo } = req.body;
  
  const correoExiste = "SELECT ID FROM usuarios WHERE correo = ?";
  
  db.query(correoExiste,[correo], (err, user) =>{
    
    if (err) {
      console.log("Error al consultar el correo:", err);
      return res
      .status(500)
      .json({
        message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
      });
    }
    
    //Comprueba si el usuario existe
    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Correo no registrado." });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000);
    
    const queryToken = "UPDATE usuarios SET reset_token = ?, token_expiry = ? WHERE ID = ?";
    
    db.query(queryToken, [token, tokenExpiry, user[0].ID], (err) => {
      if (err) {
        console.log("Error al consultar la validez del token:", err);
        return res
        .status(500)
        .json({
          message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
        });
      }
      
      const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'unifestaw@gmail.com',
          pass: 'yfdd zapy xbxp ghsc'
        }
      });
      
      const resetLink = `http://localhost:3000/login/restablecer/${token}`;
      const mailOptions = {
        from: 'unifestaw@gmail.com',
        to: correo,
        subject: 'Restablecer contraseña',
        html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>El enlace es válido por 1 hora.</p>`
      };
      
      //Envia el correo con callback
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log('Error al enviar el correo:', err);
          res.status(500).json({ message: 'Error al procesar la solicitud de recuperación.' });
          
        } else {
          console.log('Correo enviado:', info.response);
          res.status(200).json({ message: 'Correo de restablecimiento enviado con éxito.' });
        }
      });
    });
    
  });
  
  
});

router.get('/restablecer/:token', async (req, res) => {
  const { token } = req.params;
  

  const queryToken = `SELECT ID FROM usuarios WHERE reset_token = ? AND token_expiry > NOW()`;
  
  db.query(queryToken, [token], (err, user) => {
    if (err) {
      console.log("Error al consultar el token:", err);
      return res
      .status(500)
      .json({
        message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
      });
    }
    if (!user) {
      return res.status(400).send('El enlace de restablecimiento es inválido o ha caducado.');
    }
    
    //Renderiza la página de restablecimiento
    res.render('restablecer', { token });
  })
});

router.post('/restablecer', async (req, res) => {
  const {token, password, confirmPassword } = req.body;
  
  if(password !== confirmPassword){
    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
  }
  
  const queryToken = `SELECT ID FROM usuarios WHERE reset_token = ? AND token_expiry > NOW()`;
  db.query(queryToken, [token], (err, user) => {
    if (err) {
      console.log("Error al consultar el token:", err);
      return res
      .status(500)
      .json({
        message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
      });
    }
    
    if (!user) {
      return res.status(400).json({ message: 'El enlace de restablecimiento es inválido o ha caducado.' });
    }
    
    //Encripta la nueva contraseña 
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
      } 
      //Actualiza la contraseña en la base de datos y elimina el token
      const queryUpdate = `UPDATE usuarios SET contrasenia = ?, reset_token = NULL, token_expiry = NULL WHERE ID = ?`;

      console.log(user[0].ID)

      db.query(queryUpdate, [hashedPassword, user[0].ID], (err) => {
        if (err) {
          console.log("Error al modificar la contraseña:", err);
          return res.status(500).json({message: "Hubo un error al procesar la solicitud. Intenta de nuevo.",
          });
        }
        res.redirect('/');
      })
    });
    
    
    
  })
});



module.exports = router;
