import { Helmet } from 'react-helmet';

const Terminos = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '900px', 
      margin: '0 auto', 
      background: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
    }}>
      <Helmet>
        <title>Términos y Condiciones - Novost</title>
      </Helmet>

      <h1>Términos y Condiciones</h1>
      <p style={{ color: '#777', fontSize: '0.9rem' }}>
        Última actualización: {new Date().getFullYear()}
      </p>

      <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />

      <section style={{ lineHeight: '1.7', color: '#555' }}>
        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al acceder y utilizar el sitio web y los servicios de Novost, usted acepta 
          cumplir con los presentes Términos y Condiciones. Si no está de acuerdo con 
          alguno de estos términos, le recomendamos abstenerse de utilizar nuestros servicios.
        </p>

        <h2>2. Servicios Ofrecidos</h2>
        <p>
          Novost ofrece servicios de restaurante y sistema de reservas en línea. 
          Nos reservamos el derecho de modificar, suspender o descontinuar cualquier 
          parte del servicio sin previo aviso.
        </p>

        <h2>3. Registro de Usuario</h2>
        <p>
          Para realizar reservas, el usuario podrá crear una cuenta proporcionando 
          información veraz y actualizada. El usuario es responsable de mantener la 
          confidencialidad de sus credenciales de acceso.
        </p>

        <h2>4. Reservas</h2>
        <ul>
          Todas las reservas están sujetas a disponibilidad.
          La confirmación de la reserva será enviada al correo electrónico registrado.
          Novost podrá cancelar reservas en caso de fuerza mayor o incumplimiento de estos términos.
        </ul>

        <h2>5. Cancelaciones y Modificaciones</h2>
        <p>
          Las cancelaciones deben realizarse con al menos 24 horas de anticipación. 
          En caso de no presentarse sin previo aviso, Novost podrá restringir futuras reservas.
        </p>

        <h2>6. Política de Pagos</h2>
        <p>
          Algunos servicios o eventos especiales pueden requerir pago anticipado. 
          Los precios están sujetos a cambios sin previo aviso.
        </p>

        <h2>7. Protección de Datos Personales</h2>
        <p>
          Los datos personales proporcionados serán tratados conforme a la normativa 
          vigente en materia de protección de datos. La información se utilizará 
          exclusivamente para la gestión de reservas, atención al cliente y mejoras del servicio.
        </p>

        <h2>8. Conducta del Usuario</h2>
        <p>
          El usuario se compromete a utilizar el sitio web y los servicios de manera 
          responsable y respetuosa. Novost se reserva el derecho de negar el servicio 
          a cualquier persona que incumpla estas normas.
        </p>

        <h2>9. Propiedad Intelectual</h2>
        <p>
          Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos y diseño, 
          es propiedad de Novost y está protegido por las leyes de propiedad intelectual.
        </p>

        <h2>10. Limitación de Responsabilidad</h2>
        <p>
          Novost no será responsable por daños indirectos, incidentales o consecuenciales 
          derivados del uso o imposibilidad de uso del sitio web o los servicios ofrecidos.
        </p>

        <h2>11. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento. 
          Las modificaciones entrarán en vigor desde su publicación en el sitio web.
        </p>

        <h2>12. Legislación Aplicable</h2>
        <p>
          Estos términos se rigen por las leyes vigentes en el país donde opera Novost. 
          Cualquier controversia será resuelta ante las autoridades competentes.
        </p>
      </section>
    </div>
  );
};

export default Terminos;