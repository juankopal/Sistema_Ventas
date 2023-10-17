﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using SistemaVenta.Entity;

namespace SistemaVenta.BLL.Interfaces
{
    public interface INegocioService
    {
        Task<Negocio> Obtener();
        Task<Negocio> GuardarCambios(Negocio entidad, Stream Logo=null, string nombreLogo="");

        //agrego comentario en la rama Juan

        //se hace cambio en la rama Main

        //Cambio rama Main desde web

    }
}
