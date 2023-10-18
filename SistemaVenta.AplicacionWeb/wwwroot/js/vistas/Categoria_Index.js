const MODELO_BASE = {

    idCategoria: 0,
    descripccion: "",
    esActivo: 1,

}

$(document).ready(function () {

    tabledata = $('#tbdata').DataTable({
        responsive: true,
        "ajax": {
            "url": '/Categoria/Lista',
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "idCategoria", "visible": false, "searchable": false },
            { "data": "descripcion" },
            {
                "data": "esActivo", render: function (data) {
                    if (data == 1)
                        return '<span class="badge badge-info">Activo</span>';
                    else
                        return '<span class="badge badge-danger">No Activo</span>';


                }
            },
            {
                "defaultContent": '<button class="btn btn-primary btn-editar btn-sm mr-2"><i class="fas fa-pencil-alt"></i></button>' +
                    '<button class="btn btn-danger btn-eliminar btn-sm"><i class="fas fa-trash-alt"></i></button>',
                "orderable": false,
                "searchable": false,
                "width": "80px"
            }
        ],
        order: [[0, "desc"]],
        dom: "Bfrtip",
        buttons: [
            {
                text: 'Exportar Excel',
                extend: 'excelHtml5',
                title: '',
                filename: 'Reporte Categorias',
                exportOptions: {
                    columns: [1, 2]
                }
            }, 'pageLength'
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
        },
    });

});

function mostrarModel(model = MODELO_BASE) {
    $("#txtId").val(model.idUsuario);
    $("#txtDescripcion").val(model.descripcion);
    $("#cboEstado").val(model.esActivo);

    $("#modalData").modal("show")

}

$("#btnNuevo").click(function () {
    mostrarModel();
});

$("#btnGuardar").click(function () {
    
    if ($("#txtDescripcion").val().trim() == "") {
        toastr.warning("", "debe completar el campo descripccion");
        $("#txtDescripcion").focus();
        return;
    }

    const modelo = structuredClone(MODELO_BASE);

    
    debugger;
    modelo["idCategoria"] = parseInt($("#txtIdCategoria").val());
    modelo["descripcion"] = $("#txtDescripcion").val();
    modelo["esActivo"] = $("#cboEstado").val();

    $("#modalData").find("div.modal-content").LoadingOverlay("show");

    if (modelo.idCategoria == 0) {
        fetch("/Categoria/Crear", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(modelo)
        })
            .then(response => {
                $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then(reponseJSON => {

                if (reponseJSON.estado) {
                    tabledata.row.add(reponseJSON.objeto).draw(false);
                    $("#modalData").modal("hide");
                    swal("Listo", "La categoria fue creada", "success");
                } else {
                    swal("Lo sentimos", reponseJSON.mensaje, "error");
                }
            })
    } else {
        fetch("/Categoria/Editar", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(modelo)
        })
            .then(response => {
                $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then(reponseJSON => {
                if (reponseJSON.estado) {
                    tabledata.row(filaSeleccionada).data(reponseJSON.objeto).draw(false);
                    filaSeleccionada = null;
                    $("#modalData").modal("hide");
                    swal("Listo", "La categoria fue modificada", "success");
                } else {
                    swal("Lo sentimos", reponseJSON.mensaje, "error");
                }
            })
    }
})

let filaSeleccionada;

$("#tbdata tbody").on("click", ".btn-editar", function () {
    filaSeleccionada = tabledata.row($(this).parents('tr'))
    var data = tabledata.row($(this).parents('tr')).data();
    mostrarModel(data)
});

$("#tbdata tbody").on("click", ".btn-eliminar", function () {
    filaSeleccionada = tabledata.row($(this).parents('tr'))
    var data = tabledata.row($(this).parents('tr')).data();
    console.log(data);

    swal({
        title: "¿Estás seguro de eliminar?",
        text: `eliminar la categoria ${data.descripcion}`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "No, cancelar",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (respuesta) {
            if (respuesta) {
                $("#showSweetAlert").LoadingOverlay("show");

                fetch(`/Categoria/Eliminar?IdCategoria=${data.idCategoria}`, {
                    method: "DELETE",
                })
                    .then(response => {
                        $("#showSweetAlert").LoadingOverlay("hide");
                        return response.ok ? response.json() : Promise.reject(response);
                    })
                    .then(reponseJSON => {
                        if (reponseJSON.estado) {
                            tabledata.row(filaSeleccionada).remove().draw();
                            swal("Listo", "La categoria fue eliminada", "success");
                        } else {
                            swal("Lo sentimos", reponseJSON.mensaje, "error");
                        }
                    })
            }
        }
    )
});