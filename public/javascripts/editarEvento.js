"use strict";

//Función para formatear la fecha como DD/MM/YY
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
  const mes = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
  const año = String(date.getFullYear()).slice(2); // Extrae los dos últimos dígitos del año
  
  return `${dia}/${mes}/${año}`;
}

//Cuando se envie el formulario "formEditarEvento"
$(document).ready(function () {
  $("#formEditarEvento").on("submit", async function (event) {
    event.preventDefault();

    //Obtenemos los datos
    const eventoId = $("#id").val();
    const url = `/evento/actualizar/${eventoId}`;
    const título = $("#título").val();
    const descripción = $("#descripción").val();
    const tipo = $("#tipo").val();
    const fecha = $("#fecha").val();
    const hora = $("#hora").val();
    const duración = parseInt($("#duración").val(), 10);
    const ubicación = $("#ubicación").val();
    const facultad = $("#facultad").val();
    const capacidad_máxima = $("#capacidad_máxima").val();
    const capacidad_original = $("#capacidad_original").val();

    //Validación de título vacio
    if (título === " ") {
      Swal.fire("El título no puede ser vacío");
      return false;
    }

    //Validación de que la fecha y la hora sean posteriores a hoy
    const ahora = new Date();
    const fechaHoraIngresada = new Date(`${fecha}T${hora}`);
    if (fechaHoraIngresada <= ahora) {
      Swal.fire("La fecha y hora deben ser posteriores al momento actual");
      return false;
    }

    //Validación de que evento tenga duración
    if (isNaN(duración) || duración <= 0) {
      Swal.fire("La duración debe ser un número mayor a 0");
      return false;
    }

    //Validación de que evento tenga ubicación
    if (ubicación === " ") {
      Swal.fire("La ubicación no puede ser vacía");
      return false;
    }

    //Validación de que evento tenga una capacidad positiva
    if (capacidad_máxima <= 0) {
      Swal.fire("La capacidad debe ser positiva");
      return false;
    }

    //Validación de que no se reduzca la capacidad
    if (capacidad_máxima < capacidad_original) {
      Swal.fire("La capacidad no puede ser reducida, solo aumentada");
      return false;
    }

    //Petición ajax a /evento/actualizar/:idEvento
    $.ajax({
      url: url,
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
        capacidad_original,
      },
      success: function (response) {
        Swal.fire({
          title: "Se actualizó la información del evento!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {

          const fechaFormateada = formatearFecha(fecha);

          $("#eventoTitulo").text(título);
          $("#eventoDescripcion").text(descripción);
          $("#eventoTipo").text(tipo);
          $("#eventoFecha").text(fechaFormateada);
          $("#eventoHora").text(hora);
          $("#eventoDuracion").text(duración + " minutos");
          $("#eventoUbicacion").text(ubicación);
          $("#eventoCapacidad").text(capacidad_máxima);

          const facultadNombre = $("#facultad option:selected").text();
          $("#eventoFacultad").text(facultadNombre);

          $("#editarEvento").modal("hide");
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
