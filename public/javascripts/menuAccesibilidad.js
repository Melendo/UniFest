"use strict";

$(document).ready(function () {
  $("#formMenuAccesibilidad").on("submit", async function (event) {
    event.preventDefault();

    const tamaño_letra = $("#tamaño-letra").val();
    const esquema_colores = $("#esquema-colores").val();

    const tables = document.querySelectorAll("table");
    const buttons = document.querySelectorAll("button");
    const links = document.querySelectorAll("a");
    const inputs = document.querySelectorAll("input");
    const textareas = document.querySelectorAll("textarea");

    if (esquema_colores === "oscuro") {
      document.body.classList.add("dark-scheme");
      tables.forEach(table => {
        table.classList.add("table-dark");
      });
    } else {
      document.body.classList.remove("dark-scheme");
      tables.forEach(table => {
        table.classList.remove("table-dark");
      });
    }

    if (tamaño_letra === "grande") {
      document.body.classList.remove("fs-4");
      document.body.classList.add("fs-5");
      buttons.forEach(button => {
        button.classList.add("btn-lg");
      });
      links.forEach(link => {
        link.classList.remove("fs-4");
        link.classList.add("fs-5");
      });
    } else if (tamaño_letra === "muy-grande"){
      document.body.classList.remove("fs-5");
      document.body.classList.add("fs-4");
      buttons.forEach(button => {
        button.classList.add("btn-lg");
      });
      links.forEach(link => {
        link.classList.remove("fs-5");
        link.classList.add("fs-4");
      });
    }else {
      document.body.classList.remove("fs-5");
      document.body.classList.remove("fs-4");
      buttons.forEach(button => {
        button.classList.remove("btn-lg");
      });
      links.forEach(link => {
        link.classList.remove("fs-4");
        link.classList.remove("fs-5");
      });
    }
  });
});
