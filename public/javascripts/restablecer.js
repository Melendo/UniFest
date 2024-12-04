$(document).ready(function () {
    $("#restablecerForm").on("submit", function (e) {
      e.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada
  
      // Obtener los valores del formulario
      const token = $("input[name='token']").val();
      const password = $("#password").val();
      const confirmPassword = $("#confirmPassword").val();
  
      // Validar contraseñas
      if (password !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Las contraseñas no coinciden.",
        });
        return;
      }

      if (password.length < 4) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Las contraseña debe tener al menos 4 caracteres",
          });
        return false;
    }
  
      // Enviar la solicitud AJAX
      $.ajax({
        url: "/login/restablecer",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ token, password, confirmPassword }),
        success: function (response) {
          // Mostrar mensaje de éxito y redirigir
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: response.message || "Contraseña restablecida correctamente.",
          }).then(() => {
            // Redirigir al inicio de sesión o página deseada
            window.location.href = "/login";
          });
        },
        error: function (xhr) {
          // Manejar errores de la solicitud
          let errorMessage = xhr.responseJSON?.message || "Ocurrió un error. Intenta de nuevo.";
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
          });
        },
      });
    });
  });
  