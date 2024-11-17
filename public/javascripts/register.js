"use strict";

$(document).ready(function () {
    $('#formRegister').on('submit', async function (event) {
        event.preventDefault();

        // Obtener los valores de los campos del formulario
        const nombre = $('#nombre').val().trim();
        const telefono = $('#telefono').val().trim();
        const email = $('#email').val().trim();
        const contrasenia = $('#pwd').val().trim();
        const confContrasenia = $('#confPwd').val().trim();
        const facultad = $('#facultad').val();
        const esOrganizador = $('#organizador').prop('checked') ? 1 : 0;

        // Validacion de nombre
        if (nombre === "") {
            alert("Por favor, introduzca su nombre.");
            return false;
        }

        // Validacion de teléfono
        if (!/^\d{9}$/.test(telefono)) {
            alert("Por favor, introduzca un número de teléfono válido de 9 dígitos.");
            return false;
        }

        // Validacion de email
        const correoSplit = email.split("@");
        if (correoSplit.length !== 2 || correoSplit[1] !== "ucm.es") {
            alert("El correo proporcionado no pertenece a la UCM o no tiene un formato válido.");
            return false;
        }

        // Validacion de contraseña
        if(confContrasenia !== contrasenia){
            alert("Las contraseñas no coinciden");
            return false;
        }
        if (contrasenia.length < 4) {
            alert("La contraseña debe tener al menos 4 caracteres.");
            return false;
        }

        // Validacion de facultad
        if (!facultad) {
            alert("Por favor, seleccione una facultad.");
            return false;
        }

        // Si todo es válido
        alert("Formulario enviado correctamente.");

         $.ajax({
             url: '/register/register',
             method: 'POST',
             data: { nombre, telefono, email, contrasenia, confContrasenia, facultad, esOrganizador},
             success: function(response) {
                 console.log('Formulario enviado con éxito:', response);
                 window.location.href = '/login';
             },
             error: function(error) {
                 console.error('Error al enviar el formulario:', error);
            }
         });
    });
});
