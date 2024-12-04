"use strict";

//Cuando se envie el formulario "formEditarPerfil"
$(document).ready(function () {
  $("#formEditarPerfil").on("submit", async function (event) {
    event.preventDefault();

    //Obtención de datos
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

    //Petición ajax a /profile/actualizar y cargado dinámico
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
          
          $("#profileTable").find("td").eq(0).text(nombre);

          $("#profileTable")
            .find("td")
            .eq(2)
            .text(telefono || "-");

          $("#profileTable")
            .find("td")
            .eq(3)
            .text($("#facultad option:selected").text());

          $("#editarPerfilModal").modal("hide");
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
