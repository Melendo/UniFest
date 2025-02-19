"use strict";

//Cuando se clique en el boton con clase "btn-inscripcion"
$(document).ready(function () {
    $('.btn-inscripcion').click(function (event) {
        event.preventDefault();
        
        //Obtención de datos
        const eventoId = $(this).data('evento-id');
        const action = $(this).text().trim();
        const url = (action === 'Cancelar inscripción' || action === 'Cancelar espera') ? `/evento/cancelar/${eventoId}` : `/evento/inscribirse/${eventoId}`;
        
        //Petición ajax al enpoint específico dependiendo de el rol y estado del usuario en respecto al evento
        $.ajax({
            url: url,
            type: 'POST',
            success: function (response) {
                if(response.estado === "inscrito"){
                    Swal.fire({
                        title: response.titulo,
                        text: response.message,
                        icon: "success",
                        confirmButtonText: "OK"
                    }).then(() => {
                        $('.btn-inscripcion').text('Cancelar inscripción'); 
                        $('#eventoOcupado').text(response.plazasOcupadas + 1);
                    });
                }
                else if(response.estado === "en_espera"){
                    Swal.fire({
                        title: response.titulo,
                        text: response.message,
                        confirmButtonText: "OK"
                    }).then(() => {
                        $('.btn-inscripcion').text('Cancelar espera');
                        $('#eventoOcupado').text(response.plazasOcupadas);
                    });
                }
                else{
                    Swal.fire({
                        title: response.titulo,
                        text: response.message,
                        confirmButtonText: "OK"
                    }).then(() => {
                        $('.btn-inscripcion').text('Inscríbete ya!');
                        $('#eventoOcupado').text(response.plazasOcupadas);
                    });
                }
                
            },
            error: function (xhr) {
                Swal.fire(
                    "Error",
                    xhr.responseJSON?.message || "Ocurrió un error. Inténtalo de nuevo.",
                    "error"
                );
            }
        });
    });
});
