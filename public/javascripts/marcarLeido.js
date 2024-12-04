"use strict";

//Cuando se clique el boton con clase "btn-leido"
$(document).ready(function () {
  $(".btn-leido").click(function (event) {
    event.preventDefault();

    //Obtención de datos
    const id = $(this).data("id");
    const url = `/notificaciones/marcar-leida/${id}`;

    //Petición a notificaciones/marcar-leida/id
    $.ajax({
      url: url,
      type: "POST",
      success: function (response) {
        Swal.fire({
          title: "Notificación marcada como leída!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          const row = $(`[data-id="${id}"]`).closest("tr");
          const button = $(`[data-id=${id}]`);
          button.replaceWith("<span>Leído</span>"); 
          row.removeClass("fw-bold");
        });
      },
      error: function (error) {
        const errorMessage = error.responseJSON?.message || "Error desconocido. Intentelo nuevamente";
        Swal.fire({
          icon: "error",
          title: "Algo salió mal",
          text: errorMessage,
        });
      },
    });
  });
});
