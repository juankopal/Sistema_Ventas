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
    public class CategoriaService : ICategoriaService
    {

        private readonly IGenericRepository<Categoria> _repository;
        public CategoriaService(IGenericRepository<Categoria> repository)
        {
            _repository = repository;
        }
        public async Task<List<Categoria>> Lista()
        {
            IQueryable<Categoria> query = await _repository.Consultar();
            return query.ToList();
        }
        public async Task<Categoria> Crear(Categoria entidad)
        {
            try
            {
                Categoria categoria_creada = await _repository.Crear(entidad);
                if(categoria_creada.IdCategoria == 0)
                {
                    throw new TaskCanceledException("No se pudo crear la categoria");
                }
                return categoria_creada;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Categoria> Editar(Categoria entidad)
        {
            try
            {
                Categoria categoria_encontrada = await _repository.Obterner(c => c.IdCategoria == entidad.IdCategoria);
                categoria_encontrada.Descripcion = entidad.Descripcion;
                categoria_encontrada.EsActivo = entidad.EsActivo;
                bool respuesta = await _repository.Editar(categoria_encontrada);

                if (!respuesta)
                {
                    throw new TaskCanceledException("No se pudo editar la categoria");
                }
                return categoria_encontrada;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Eliminar(int IdCategoria)
        {
            try
            {
                Categoria categoria_encontrada = await _repository.Obterner(c => c.IdCategoria == IdCategoria);
                if(categoria_encontrada == null)
                {
                    throw new TaskCanceledException("La categoria no existe");
                }
                bool respuesta = await _repository.eliminar(categoria_encontrada);
                return respuesta;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
