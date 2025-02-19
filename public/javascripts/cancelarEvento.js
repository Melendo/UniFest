"use strict";

//Cuando se clique la clase btn-cancelar
$(document).ready(function () {
  $(".btn-cancelar").click(function (event) {
    event.preventDefault();

    //Obtenemos datos
    const eventoId = $(this).data("evento-id");
    const url = `/evento/cancelarEvento/${eventoId}`;

    //Petición a /evento/cancelarEvento/IdDelEvento
    $.ajax({
      url: url,
      type: "POST",
      success: function (response) {
        Swal.fire({
          title: "Se canceló el evento!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "/misEventos/misEventos";
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
