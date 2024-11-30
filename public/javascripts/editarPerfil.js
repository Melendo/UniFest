"use strict";

$(document).ready(function () {
    $('#formEditarPerfil').on('submit', async function (event) {
        event.preventDefault();

        const nombre = $('#nombre').val();
        const telefono = $('#telefono').val().trim();
        const facultad = $('#facultad').val();

        //Validación del nombre
        if (nombre === "") {
            Swal.fire("El nombre no puede ser vacío");
            return false;
        }
        
         // Validación de teléfono
         if (!/^\d{9}$/.test(telefono)) {
            Swal.fire("Por favor, introduzca un número de teléfono válido de 9 dígitos.");
            return false;
        }

        // Validacion de facultad
        if (!facultad) {
            Swal.fire("Por favor, seleccione una facultad.");
            return false;
        }

        $.ajax({
            url: '/profile/actualizar',
            method: 'POST',
            data: { nombre, telefono, facultad},
            success: function(response) {
                Swal.fire({
                    title: "Usuario modificado!",
                    text: response.message,
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.reload();
                });
            },
            error: function(error) {
                const errorMessage = error.responseJSON?.message || 'Error desconocido. Inténtelo nuevamente.';
                Swal.fire({
                    icon: "error",
                    title: "Algo salió mal",
                    text: errorMessage,
                });
            }            
        });

    })});