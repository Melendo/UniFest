"use strict";

$(document).ready(function () {
    $('#formRegister').on('submit', async function (event) {
        event.preventDefault();

        // Obtener los valores de los campos del formulario
        const nombre = $('#nombre').val();
        const telefono = $('#telefono').val().trim();
        const correo = $('#correo').val().trim();
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

        // Validacion de correo
        const correoSplit = correo.split("@");
        if (correoSplit.length !== 2 || correoSplit[1] !== "ucm.es") {
            alert("El correo proporcionado no pertenece a la UCM o no tiene un formato válido.");
            return false;
        }

        // Validacion de contraseña
        if (contrasenia.length < 4 || confContrasenia.length < 4) {
            alert("La contraseña debe tener al menos 4 caracteres.");
            return false;
        }
        else if(confContrasenia !== contrasenia){
            alert("Las contraseñas no coinciden");
            return false;
        }

        // Validacion de facultad
        if (!facultad) {
            alert("Por favor, seleccione una facultad.");
            return false;
        }

        // Si todo es válido
         $.ajax({
             url: '/register/register',
             method: 'POST',
             data: { nombre, telefono, correo, contrasenia, facultad, esOrganizador},
             success: function(response) {
                 alert('Formulario enviado con éxito:' + response.message );
                 window.location.href = '/login';
             },
             error: function(error) {
                const errorMessage = error.responseJSON?.message || 'Error desconocido. Inténtelo nuevamente.';
                alert('Error al enviar el formulario: ' + errorMessage);
            }            
         });
    });
});
