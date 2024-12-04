"use strict";

$(document).ready(function() {
    var calendarEl = $('#calendar')[0]; 

    // Crear una nueva instancia del calendario
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Vista por defecto: mes completo
        events: '/home/obtenerEventos', // Ruta para obtener los eventos desde el servidor
        eventClick: function(info) { // Acción al hacer clic en un evento

            Swal.fire({
                title: "Evento: " +info.event.title,
                icon: "info",
            })
        }
    });

    // Renderiza el calendario, pero aún no lo ajustamos
    calendar.render();

    // Escuchar cuando el modal se haya mostrado completamente
    $('#calendarModal').on('shown.bs.modal', function () {
        calendar.render();
    });
});
