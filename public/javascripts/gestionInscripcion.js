$(document).ready(function () {
    $('.btn-inscripcion').click(function (event) {
        event.preventDefault();
        
        const eventoId = $(this).data('evento-id');
        const action = $(this).text().trim();
        const url = (action === 'Cancelar inscripción' || action === 'Cancelar espera') ? `/evento/cancelar/${eventoId}` : `/evento/inscribirse/${eventoId}`;
        
        // Realizar la petición AJAX
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
                        window.location.reload(); 
                    });
                }
                else{
                    Swal.fire({
                        title: response.titulo,
                        text: response.message,
                        confirmButtonText: "OK"
                    }).then(() => {
                        window.location.reload(); 
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
