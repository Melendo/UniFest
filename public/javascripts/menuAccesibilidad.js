"use strict";

$(document).ready(function () {
  $("#formMenuAccesibilidad").on("submit", async function (event) {
    event.preventDefault();

    const tamaño_letra = $("#tamaño-letra").val();
    const esquema_colores = $("#esquema-colores").val();

    const tables = document.querySelectorAll("table");

    if (esquema_colores === "oscuro") {
      document.body.classList.add("dark-scheme");
      tables.forEach((table) => {
        table.classList.add("table-dark");
      });
    } else {
      document.body.classList.remove("dark-scheme");
      tables.forEach(table => {
        table.classList.remove("table-dark");
      });
    }
  });
});
