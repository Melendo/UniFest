$(document).ready(function () {
    $('#forgotPasswordForm').on('submit', function (event) {
      event.preventDefault();
  
      const email = $('#emailRecuperar').val().trim();
  
      if (!email) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor, introduce tu correo electrónico.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }
      console.log(email);
  
      $.ajax({
        url: '/login/recuperar',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ correo: email }),
        success: function (response) {
          Swal.fire({
            title: 'Éxito',
            text: response.message || 'Se ha enviado un correo para restablecer tu contraseña.',
            icon: 'success',
            confirmButtonText: 'Entendido'
          });
  
          $('#forgotPasswordModal').modal('hide');
        },
        error: function (xhr) {
          const errorMessage = xhr.responseJSON?.message || 'No se pudo procesar la solicitud.';
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      });
    });
  });
  