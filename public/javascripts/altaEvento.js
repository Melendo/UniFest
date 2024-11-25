"use strict";

$(document).ready(function() {
    $('#formNuevoEvento').on('submit', async function (event) {
        event.preventDefault();

        //Si todo es válido
        $.ajax({
            url: '/misEventos/anyadirEvento',
            method: 'POST',
            data: { título, descripción, fecha, hora, ubicación, capacidad_máxima},
            success: function(response){
                Swal.fire({
                    title: "Se añadió un nuevo evento!",
                    text: response.message,
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.href = '/misEventos';
                });
                
            },
            error: function(error) {
                const errorMessage = error.responseJSON?.message || 'Error desconocido. Intentelo nuevamente';
                Swal.fire({
                    icon:"error",
                    title: "Algo salió mal",
                    text: errorMessage,
                });
            }
        });
    });
});