"use strict";

$("formLogin").addEventListener('submit', async function(event) {
    event.preventDefault();

    const correo = $('email').value;
    const contrasenia = $('pwd').value;

    const correoSplit = correo.split("@");

    if(correoSplit[1]!= "ucm.es"){
        alert("El correo proporcionado no pertenece a la UCM");
        return false;
    }

    
})