"use strict";

$(document).ready(function () {
  $("#formEditarPerfil").on("submit", async function (event) {
    event.preventDefault();

    const nombre = $("#nombre").val();
    const telefono = $("#telefono").val().trim();
    const facultad = $("#facultad").val();

    //Validación del nombre
    if (nombre === "") {
      Swal.fire("El nombre no puede ser vacío");
      return false;
    }

    // Validación de teléfono
    if (telefono !== "" && !/^\d{9}$/.test(telefono)) {
      Swal.fire(
        "Por favor, introduzca un número de teléfono válido de 9 dígitos o deje el campo vacío."
      );
      return false;
    }

    // Validacion de facultad
    if (!facultad) {
      Swal.fire("Por favor, seleccione una facultad.");
      return false;
    }

    $.ajax({
      url: "/profile/actualizar",
      method: "POST",
      data: { nombre, telefono, facultad },
      success: function (response) {
        Swal.fire({
          title: "Usuario modificado!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Actualizar la tabla con los nuevos datos
          $("#profileTable").find("td").eq(0).text(nombre); // Actualiza el nombre
          $("#profileTable")
            .find("td")
            .eq(2)
            .text(telefono || "-"); // Actualiza el teléfono, muestra "-" si está vacío
          $("#profileTable")
            .find("td")
            .eq(3)
            .text($("#facultad option:selected").text()); // Actualiza la facultad con el texto seleccionado

          // Opcional: Cerrar el modal si aún está abierto
          $("#editarPerfilModal").modal("hide");
        });
      },
      error: function (error) {
        const errorMessage =
          error.responseJSON?.message ||
          "Error desconocido. Inténtelo nuevamente.";
        Swal.fire({
          icon: "error",
          title: "Algo salió mal",
          text: errorMessage,
        });
      },
    });
  });
});
