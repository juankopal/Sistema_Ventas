
const MODELO_BASE = {

    idUsuario:0,
    nombre: "",
    correo: "",
    telefono:0,
    idRol: 0,
    urlFoto: "",
    esActivo: 1,

}

let tabledata;

$(document).ready(function () {

    fetch("/Usuario/ListaRol")
        .then(response => {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(responseJson => {
            if (responseJson.length > 0) {
                responseJson.forEach((item) => {
                    $("#cboRol").append(
                        $("<option>").val(item.idRol).text(item.descripcion)
                    )
                })
            }
        })

  tabledata = $('#tbdata').DataTable({
        responsive: true,
         "ajax": {
             "url": '/Usuario/Lista',
             "type": "GET",
             "datatype": "json"
         },
         "columns": [
             { "data": "idUsuario","visible":false,"searchable":false },
             {
                 "data": "urlFoto", render: function (data) {
                     return `<img style="height:60px" src=${data} class="rounded mx-auto d-block"/>`
                 }
             },
             { "data": "nombre"},
             { "data": "correo" },
             { "data": "telefono" },
             { "data": "nombreRol" },
             {
                 "data": "esActivo", render: function (data) {
                     if (data ==1)
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
                filename: 'Reporte Usuarios',
                exportOptions: {
                    columns: [2,3,4,5,6]
                }
            }, 'pageLength'
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
        },
    });

});

function mostrarModel(model = MODELO_BASE)
{
    $("#txtId").val(model.idUsuario)
    $("#txtNombre").val(model.nombre)
    $("#txtCorreo").val(model.correo)
    $("#txtTelefono").val(model.telefono)
    $("#cboRol").val(model.idRol == 0 ? $("#cboRol option:first").val():model.idRol)
    $("#cboEstado").val(model.esActivo)
    $("#txtFoto").val("")
    $("#imgUsuario").attr("src", model.urlFoto)

    $("#modalData").modal("show")

}


$("#btnNuevo").click(function () {
    mostrarModel();
})

$("#btnGuardar").click(function () {
    const inputs = $("input.input-validar").serializeArray();
    const inputs_sin_valor = inputs.filter((item => item.value.trim() == ""))

    if (inputs_sin_valor.length > 0) {
        const mensaje = `Debe completar el campo: ${inputs_sin_valor[0].name}`;
        toastr.warning("", mensaje);
        $(`input[name=${inputs_sin_valor[0].name}]`).focus()
        return
    }

    const modelo = structuredClone(MODELO_BASE);
    modelo["idUsuario"] = parseInt($("#txtId").val());
    modelo["nombre"] = $("#txtNombre").val();
    modelo["correo"] = $("#txtCorreo").val();
    modelo["telefono"] = $("#txtTelefono").val();
    modelo["idRol"] = $("#cboRol").val();
    modelo["esActivo"] = $("#cboEstado").val();

    const inputFoto = document.getElementById("txtFoto");

    const formData = new FormData();
    formData.append("foto", inputFoto.files[0]);
    formData.append("modelo", JSON.stringify(modelo));

    $("#modalData").find("div.modal-content").LoadingOverlay("show");

    if (modelo.idUsuario == 0) {
        fetch("/Usuario/Crear", {
            method: "POST",
            body: formData
        })
            .then(response => {
                $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then(reponseJSON => {
                if (reponseJSON.estado) {
                    tabledata.row.add(reponseJSON.objeto).draw(false);
                    $("#modalData").modal("hide");
                    swal("Listo", "El usuario fue creado", "success");
                } else {
                    swal("Lo sentimos", reponseJSON.mensaje, "error");
                }
            })
    } else {
        fetch("/Usuario/Editar", {
            method: "PUT",
            body: formData
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
                    swal("Listo", "El usuario fue modificado", "success");
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
        text: `eliminar al usuario ${data.nombre}`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "No, cancelar",
        closeOnConfirm: false,
        closeOnCancel:true
    },
        function (respuesta) {
            if (respuesta) {
                $("#showSweetAlert").LoadingOverlay("show");

                fetch(`/Usuario/Eliminar?IdUsuario=${data.idUsuario}`, {
                    method: "DELETE",
                })
                    .then(response => {
                        $("#showSweetAlert").LoadingOverlay("hide");
                        return response.ok ? response.json() : Promise.reject(response);
                    })
                    .then(reponseJSON => {
                        if (reponseJSON.estado) {
                            tabledata.row(filaSeleccionada).remove().draw();
                            swal("Listo", "El usuario fue eliminado", "success");
                        } else {
                            swal("Lo sentimos", reponseJSON.mensaje, "error");
                        }
                    })
            }
        }
    )
});