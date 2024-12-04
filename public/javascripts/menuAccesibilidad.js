"use strict";

function aplicarConf(esquema_colores, tamaño_letra) {
  const tables = document.querySelectorAll("table");
  const buttons = document.querySelectorAll("button");
  const links = document.querySelectorAll("a");
  const inputs = document.querySelectorAll("input");
  const textareas = document.querySelectorAll("textarea");
  const selects = document.querySelectorAll("select");

  if (esquema_colores === "oscuro") {
    document.body.classList.add("dark-scheme");
    tables.forEach((table) => {
      table.classList.add("table-dark");
    });
  } else {
    document.body.classList.remove("dark-scheme");
    tables.forEach((table) => {
      table.classList.remove("table-dark");
    });
  }

  if (tamaño_letra === "grande") {
    document.body.classList.remove("fs-4");
    document.body.classList.add("fs-5");

    buttons.forEach((button) => {
      button.classList.add("btn-lg");
    });

    links.forEach((link) => {
      link.classList.add("fs-5");
    });
    inputs.forEach((input) => {
      input.classList.add("fs-5");
    });
    textareas.forEach((textarea) => {
      textarea.classList.add("fs-5");
    });
    selects.forEach((select) => {
      select.classList.add("fs-5");
    });
  } else if (tamaño_letra === "muy-grande") {
    document.body.classList.remove("fs-5");
    document.body.classList.add("fs-4");

    buttons.forEach((button) => {
      button.classList.add("btn-lg");
    });

    links.forEach((link) => {
      link.classList.add("fs-5");
    });
    inputs.forEach((input) => {
      input.classList.add("fs-5");
    });
    textareas.forEach((textarea) => {
      textarea.classList.add("fs-5");
    });
    selects.forEach((select) => {
      select.classList.add("fs-5");
    });
  } else {
    document.body.classList.remove("fs-5");
    document.body.classList.remove("fs-4");

    buttons.forEach((button) => {
      button.classList.remove("btn-lg");
    });

    links.forEach((link) => {
      link.classList.remove("fs-5");
    });
    inputs.forEach((input) => {
      input.classList.remove("fs-5");
    });
    textareas.forEach((textarea) => {
      textarea.classList.remove("fs-5");
    });
    selects.forEach((select) => {
      select.classList.remove("fs-5");
    });
  }
}

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
    const selects = document.querySelectorAll("select");

    if (esquema_colores === "oscuro") {
      document.body.classList.add("dark-scheme");
      tables.forEach((table) => {
        table.classList.add("table-dark");
      });
    } else {
      document.body.classList.remove("dark-scheme");
      tables.forEach((table) => {
        table.classList.remove("table-dark");
      });
    }

    if (tamaño_letra === "grande") {
      document.body.classList.remove("fs-4");
      document.body.classList.add("fs-5");

      buttons.forEach((button) => {
        button.classList.add("btn-lg");
      });

      links.forEach((link) => {
        link.classList.add("fs-5");
      });
      inputs.forEach((input) => {
        input.classList.add("fs-5");
      });
      textareas.forEach((textarea) => {
        textarea.classList.add("fs-5");
      });
      selects.forEach((select) => {
        select.classList.add("fs-5");
      });
    } else if (tamaño_letra === "muy-grande") {
      document.body.classList.remove("fs-5");
      document.body.classList.add("fs-4");

      buttons.forEach((button) => {
        button.classList.add("btn-lg");
      });

      links.forEach((link) => {
        link.classList.add("fs-5");
      });
      inputs.forEach((input) => {
        input.classList.add("fs-5");
      });
      textareas.forEach((textarea) => {
        textarea.classList.add("fs-5");
      });
      selects.forEach((select) => {
        select.classList.add("fs-5");
      });
    } else {
      document.body.classList.remove("fs-5");
      document.body.classList.remove("fs-4");

      buttons.forEach((button) => {
        button.classList.remove("btn-lg");
      });

      links.forEach((link) => {
        link.classList.remove("fs-5");
      });
      inputs.forEach((input) => {
        input.classList.remove("fs-5");
      });
      textareas.forEach((textarea) => {
        textarea.classList.remove("fs-5");
      });
      selects.forEach((select) => {
        select.classList.remove("fs-5");
      });
    }

    $.ajax({
      url: "/accesibilidad/guardarConf",
      method: "POST",
      data: { esquema_colores, tamaño_letra },
      success: function (response) {
        Swal.fire({
          title: "Configuración de accesibilidad guardada",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {});
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
