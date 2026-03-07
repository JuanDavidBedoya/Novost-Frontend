import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

const Terminos = () => {
  const navigate = useNavigate();
  return (
    <div className="terminos-container">
      <Helmet>
        <title>Términos y Condiciones - Novost</title>
      </Helmet>

      <h1>Términos y Condiciones</h1>
      <p className="terminos-date">
        Última actualización: {new Date().getFullYear()}
      </p>

      <hr className="terminos-divider" />

      <section className="terminos-section">

        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al acceder, navegar y utilizar el sitio web, la aplicación o cualquier servicio 
          ofrecido por Novost (en adelante, “la Plataforma”), usted declara haber leído, 
          entendido y aceptado los presentes Términos y Condiciones en su totalidad. 
          Si no está de acuerdo con alguno de los términos aquí establecidos, deberá 
          abstenerse de utilizar nuestros servicios.
        </p>

        <h2>2. Objeto del Servicio</h2>
        <p>
          Novost es una plataforma digital que permite a los usuarios consultar información 
          del restaurante, registrarse, gestionar su perfil y realizar reservas en línea. 
          La Plataforma podrá incluir servicios adicionales como pagos electrónicos, 
          promociones especiales, eventos privados y programas de fidelización.
        </p>
        <p>
          Nos reservamos el derecho de modificar, suspender o eliminar cualquier funcionalidad 
          del sistema sin previo aviso cuando sea necesario por razones técnicas, legales 
          o comerciales.
        </p>

        <h2>3. Registro y Cuenta de Usuario</h2>
        <p>
          Para acceder a determinadas funcionalidades, el usuario deberá crear una cuenta 
          proporcionando información veraz, completa y actualizada. El usuario es 
          responsable de mantener la confidencialidad de sus credenciales de acceso.
        </p>
        <p>
          Novost no será responsable por el uso indebido de la cuenta cuando dicho uso 
          derive de negligencia del usuario en la protección de su contraseña.
        </p>

        <h2>4. Veracidad de la Información</h2>
        <p>
          El usuario garantiza que toda la información suministrada es exacta y auténtica. 
          En caso de detectarse información falsa o fraudulenta, Novost podrá suspender 
          o cancelar la cuenta sin previo aviso.
        </p>

        <h2>5. Política de Reservas</h2>
        <ul>
          Todas las reservas están sujetas a disponibilidad.
          La confirmación será enviada al correo electrónico registrado.
          Novost podrá solicitar confirmación adicional vía telefónica o electrónica.
          En fechas especiales o eventos, podrán aplicarse condiciones particulares.
        </ul>

        <h2>6. Cancelaciones, Modificaciones y No Presentación</h2>
        <p>
          Las reservas que requieran pago anticipado deberán estar confirmadas al menos 
          con 24 horas de antelación. En caso contrario, podrán ser canceladas automáticamente.
        </p>
        <p>
          Si el cliente no se presenta en la fecha y hora reservadas sin previo aviso, 
          Novost podrá restringir futuras reservas o aplicar cargos administrativos 
          cuando corresponda.
        </p>

        <h2>7. Política de Pagos y Reembolsos</h2>
        <p>
          Algunos servicios, eventos o menús especiales podrán requerir pago anticipado. 
          Los precios están expresados en moneda local e incluyen los impuestos aplicables 
          según la normativa vigente.
        </p>
        <p>
          Los reembolsos, cuando procedan, se realizarán por el mismo medio de pago 
          utilizado y estarán sujetos a los tiempos establecidos por la entidad financiera.
        </p>

        <h2>8. Protección de Datos Personales</h2>
        <p>
          Los datos personales serán tratados conforme a la legislación vigente en materia 
          de protección de datos. La información recopilada será utilizada únicamente para 
          la gestión de reservas, atención al cliente, envío de notificaciones y mejoras 
          del servicio.
        </p>
        <p>
          El usuario podrá ejercer sus derechos de acceso, rectificación, actualización 
          o eliminación de datos mediante solicitud formal a través de los canales 
          oficiales de contacto.
        </p>

        <h2>9. Uso Adecuado de la Plataforma</h2>
        <p>
          El usuario se compromete a utilizar la Plataforma de manera lícita, ética y 
          respetuosa. Queda prohibido:
        </p>
        <ul>
          Realizar reservas fraudulentas o masivas.
          Intentar vulnerar la seguridad del sistema.
          Introducir virus o cualquier código malicioso
          Utilizar la plataforma con fines ilícitos.
        </ul>

        <h2>10. Propiedad Intelectual</h2>
        <p>
          Todos los contenidos del sitio web, incluyendo textos, imágenes, logotipos, 
          diseños, código fuente y elementos gráficos, son propiedad de Novost o cuentan 
          con licencia para su uso. Queda prohibida su reproducción total o parcial 
          sin autorización previa y por escrito.
        </p>

        <h2>11. Disponibilidad del Servicio</h2>
        <p>
          Novost no garantiza que la Plataforma esté disponible de manera ininterrumpida 
          o libre de errores. Podrán realizarse mantenimientos programados o correctivos 
          que impliquen la suspensión temporal del servicio.
        </p>

        <h2>12. Limitación de Responsabilidad</h2>
        <p>
          Novost no será responsable por daños indirectos, incidentales, especiales o 
          consecuenciales derivados del uso o imposibilidad de uso de la Plataforma. 
          Tampoco será responsable por fallos derivados de terceros proveedores de servicios 
          tecnológicos o financieros.
        </p>

        <h2>13. Fuerza Mayor</h2>
        <p>
          No seremos responsables por el incumplimiento de obligaciones cuando este 
          se deba a causas de fuerza mayor, tales como desastres naturales, fallas 
          eléctricas, disturbios civiles, pandemias o disposiciones gubernamentales.
        </p>

        <h2>14. Modificaciones de los Términos</h2>
        <p>
          Novost podrá modificar estos Términos y Condiciones en cualquier momento. 
          Las actualizaciones entrarán en vigor desde su publicación en la Plataforma. 
          El uso continuo del servicio implicará la aceptación de dichas modificaciones.
        </p>

        <h2>15. Legislación Aplicable y Jurisdicción</h2>
        <p>
          Los presentes Términos se rigen por la legislación vigente en el país donde 
          opera Novost. Cualquier controversia será resuelta ante las autoridades 
          judiciales competentes del domicilio principal de la empresa.
        </p>

        <h2>16. Contacto</h2>
        <p>
          Para cualquier consulta relacionada con estos Términos y Condiciones, 
          el usuario podrá comunicarse a través de los canales oficiales de atención 
          al cliente disponibles en la Plataforma.
        </p>

      </section>
    </div>
  );
};

export default Terminos;