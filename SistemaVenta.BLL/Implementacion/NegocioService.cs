using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;

namespace SistemaVenta.BLL.Implementacion
{
    public class NegocioService : INegocioService
    {
        private readonly IGenericRepository<Negocio> _repositorio;
        private readonly IFarebaseServices _fireBaseService;

        public NegocioService(IGenericRepository<Negocio> repositorio, IFarebaseServices fireBaseService)
        {
            _repositorio=repositorio;
            _fireBaseService=fireBaseService;
        }
        public async Task<Negocio> Obtener()
        {
            try
            {
                Negocio negocio_encontrado = await _repositorio.Obterner(n=>n.IdNegocio == 1);
                return negocio_encontrado;
            }
            catch (Exception)
            {
                throw;
            }
        }
        public async Task<Negocio> GuardarCambios(Negocio entidad, Stream Logo = null, string nombreLogo = "")
        {
            try
            {
                Negocio negocio_encontrado = await _repositorio.Obterner(n => n.IdNegocio == 1);

                negocio_encontrado.NumeroDocumento = entidad.NumeroDocumento;
                negocio_encontrado.Nombre = entidad.Nombre;
                negocio_encontrado.Correo = entidad.Correo;
                negocio_encontrado.Telefono = entidad.Telefono;
                negocio_encontrado.Direccion = entidad.Direccion;
                negocio_encontrado.PorcentajeImpuesto = entidad.PorcentajeImpuesto;
                negocio_encontrado.SimboloMoneda = entidad.SimboloMoneda;

                negocio_encontrado.NombreLogo = negocio_encontrado.NombreLogo == "" ? nombreLogo : negocio_encontrado.NombreLogo;

                if(Logo != null)
                {
                    string urlFoto = await _fireBaseService.SubirStorage(Logo, "carpeta_logo", negocio_encontrado.NombreLogo);
                    negocio_encontrado.UrlLogo = urlFoto;
                }

                await _repositorio.Editar(negocio_encontrado);
                return negocio_encontrado;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
