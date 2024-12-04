"use strict";

//Cuando se envie el formulario "formLogin"
$(document).ready(function() {
    $('#formLogin').on('submit', async function (event) {
        event.preventDefault();

        //Obtención de valores del formulario
        const correo = $('#correo').val();
        const contraseña = $('#contraseña').val().trim();

        //Validación del correo
        const correoSplit = correo.split("@");
        if (correoSplit.length !== 2 || correoSplit[1] !== "ucm.es") {
            Swal.fire("El correo proporcionado no pertenece a la UCM o no tiene un formato válido.");
            return false;
        }

        //Validación de la contraseña
        if(contraseña === ""){
            Swal.fire("Por favor, introduzca su contraseña.");
            return false;
        }

        //Petición al endpoint /login/login para iniciar la sesión
        $.ajax({
            url: '/login/login',
            method: 'POST',
            data: { correo, contraseña},
            success: function(response){
                Swal.fire({
                    title: "Has iniciado sesión!",
                    text: response.message,
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.href = '/home';
                });
                
            },
            error: function(error) {
                const errorMessage = error.responseJSON?.message || 'Error desconocido. Intentelo nuevamente';
                Swal.fire({
                    icon:"error",
                    title: "Algo salió mal",
                    text: errorMessage,
                });
            }
        });
    });
});