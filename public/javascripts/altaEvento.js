"use strict";

$(document).ready(function() {
    $('#formNuevoEvento').on('submit', async function (event) {
        event.preventDefault();

        const título = $('#título').val();
        const descripción = $('#descripción').val();
        const fecha = $('#fecha').val();
        const hora = $('#hora').val();
        const ubicación = $('#ubicación').val();
        const facultad = $('#facultad').val();
        const capacidad_máxima = $('#capacidad_máxima').val();

        //Si todo es válido
        $.ajax({
            url: '/misEventos/anyadir',
            method: 'POST',
            data: { título, descripción, fecha, hora, ubicación, facultad, capacidad_máxima},
            success: function(response){
                Swal.fire({
                    title: "Se añadió un nuevo evento!",
                    text: response.message,
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.href = '/home';
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