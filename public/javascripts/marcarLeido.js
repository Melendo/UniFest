"use strict";

$(document).ready(function () {
  $(".btn-leido").click(function (event) {
    event.preventDefault();

    const id = $(this).data("id");
    const url = `/notificaciones/marcar-leida/${id}`;

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
          button.replaceWith("<span>Leído</span>"); //Cambia el botón por el texto Leído
          // row.find(".btn-leido").remove(); //Quita el botón
          row.removeClass("fw-bold"); //Quita la negrita
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
