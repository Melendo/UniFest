"use strict";

$(document).ready(function () {
  $("#formNuevoEvento").on("submit", async function (event) {
    event.preventDefault();

    const título = $("#título").val();
    const descripción = $("#descripción").val();
    const tipo = $("#tipo").val();
    const fecha = $("#fecha").val();
    const hora = $("#hora").val();
    const duración = parseInt($("#duración").val(), 10);
    const ubicación = $("#ubicación").val();
    const facultad = $("#facultad").val();
    const capacidad_máxima = $("#capacidad_máxima").val();

    if (título === " ") {
      Swal.fire("El título no puede ser vacío");
      return false;
    }

    // Validar que la fecha y la hora sean posteriores al momento actual
    const ahora = new Date(); // Momento actual
    const fechaHoraIngresada = new Date(`${fecha}T${hora}`); // Combinar fecha y hora

    if (fechaHoraIngresada <= ahora) {
      Swal.fire("La fecha y hora deben ser posteriores al momento actual");
      return false;
    }

    if (isNaN(duración) || duración <= 0) {
      Swal.fire("La duración debe ser un número mayor a 0");
      return false;
    }

    if (ubicación === " ") {
      Swal.fire("La ubicación no puede ser vacía");
      return false;
    }

    if (capacidad_máxima <= 0) {
      Swal.fire("La capacidad debe ser positiva");
      return false;
    }

    //Si todo es válido
    $.ajax({
      url: "/misEventos/anyadir",
      method: "POST",
      data: {
        título,
        descripción,
        tipo,
        fecha,
        hora,
        duración,
        ubicación,
        facultad,
        capacidad_máxima,
      },
      success: function (response) {
        Swal.fire({
          title: "Se añadió un nuevo evento!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });

          const nuevaFila = `
            <tr>
              <td>${título}</td>
              <td>${fechaFormateada}</td>
              <td>
                <a href="/evento/evento/${response.eventoId}" class="btn btn-secondary" role="button">Ver evento</a>
              </td>
            </tr>
          `;

          const tabla = $("table tbody");
          const filas = tabla.find("tr");

          let añadido = false;

          filas.each(function () {
            const fechaExistente = new Date($(this).find("td:nth-child(2)").text());
            if (fechaHoraIngresada < fechaExistente) {
              $(this).before(nuevaFila);
              añadido = true;
              return false;
            }
          });

          if (!añadido) {
            tabla.append(nuevaFila); // Agregar al final si no hay eventos más tardíos
          }

          $("#formNuevoEvento")[0].reset();
          $("#añadirNuevoEvento").modal("hide");
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
