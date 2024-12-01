$(document).ready(function () {
  $(".btn-leido").click(function (event) {
    event.preventDefault();

    const id = $(this).data("id");
    const url = `/notificaciones/marcar-leida/${id}`;

    // Realizar la petición AJAX
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
            window.location.reload();
          });
        },
        error: function (error) {
          const errorMessage =
            error.responseJSON?.message ||
            "Error desconocido. Intentelo nuevamente";
          Swal.fire({
            icon: "error",
            title: "Algo salió mal",
            text: errorMessage,
          });
        },
      });
  });
});
