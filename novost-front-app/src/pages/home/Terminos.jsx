import React from 'react';
import { Helmet } from 'react-helmet';

const Terminos = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <Helmet>
        <title>Términos y Condiciones - Novost</title>
      </Helmet>
      <h1>Términos y Condiciones</h1>
      <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />
      <p style={{ lineHeight: '1.6', color: '#555' }}>
        Bienvenido a Novost. Al acceder y utilizar nuestros servicios de agendamiento y restaurante, usted acepta cumplir con los siguientes términos y condiciones...
      </p>
      <p style={{ lineHeight: '1.6', color: '#555', marginTop: '1rem' }}>
        <strong>1. Reservas:</strong> Las reservas están sujetas a disponibilidad. Se requiere confirmación previa.<br/>
        <strong>2. Cancelaciones:</strong> Toda cancelación debe realizarse con al menos 24 horas de antelación.<br/>
        <strong>3. Privacidad:</strong> Sus datos personales están protegidos y solo se usan para gestionar su experiencia en Novost.
      </p>
    </div>
  );
};

export default Terminos;