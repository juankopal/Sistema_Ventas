﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Net;
using System.Net.Mail;

using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;


namespace SistemaVenta.BLL.Implementacion
{
    public class CorreoService : ICorreoService
    {
        private readonly IGenericRepository<Configuracion> _repository;
        public CorreoService(IGenericRepository<Configuracion> repository)
        {
            _repository = repository;
        }
        public async Task<bool> Enviarcorreo(string CorreoDestino, string Asunto, string Mensaje)
        {
            try
            {
                IQueryable<Configuracion> query = await _repository.Consultar(c => c.Recurso.Equals("Servicio_Correo"));

                Dictionary<string, string> Config2 = query.ToDictionary(keySelector: c => c.Propiedad, elementSelector: c => c.Valor);

                var credenciales = new NetworkCredential(Config2["correo"], Config2["clave"]);
                var correo = new MailMessage()
                {
                    From = new MailAddress(Config2["correo"], Config2["alias"]),
                    Subject = Asunto,
                    Body = Mensaje,
                    IsBodyHtml = true    
                };
                correo.To.Add(new MailAddress(CorreoDestino));

                var clienteservidor = new SmtpClient()
                {
                    Host = Config2["host"],
                    Port = int.Parse(Config2["puerto"]),
                    Credentials= credenciales,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    EnableSsl = true,
                };
                clienteservidor.Send(correo);
                return true;
            }
            catch (Exception ex)
            {
                return false;
                throw ex;
            }
        }
    }
}
