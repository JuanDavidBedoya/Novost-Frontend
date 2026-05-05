import { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import CheckoutForm from './CheckoutForm';
import { X, CreditCard, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

// Modal de pago para reservas con temporizador y integración de Stripe

export default function PagoModal({ clientSecret, idReserva, onClose }) {

  // Estado: tiempo restante para completar el pago y referencia al intervalo del timer

  const [tiempoRestante, setTiempoRestante] = useState(120);
  const timerRef = useRef(null);

  // Effect: inicia temporizador de 2 minutos que muestra advertencia y cierra modal si expira

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.warning(" Tiempo de pago expirado. Por favor, intenta nuevamente.");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onClose]);

  // Función auxiliar: convierte segundos a formato minutos:segundos

  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!clientSecret) return null;

  // Configuración de apariencia de Stripe: tema, colores personalizados y estilos de inputs

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#8a2be2', 
      colorBackground: 'transparent', 
      colorText: '#2c3e50',
      colorDanger: '#e53e3e',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid transparent',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
      },
      '.Input:focus': {
        borderColor: '#8a2be2',
        boxShadow: '0 0 0 1px #8a2be2',
      }
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="novost-modal-overlay">
      <div className="reserva-glass-card novost-modal-content">
        
        <button 
          onClick={onClose}
          className="modal-close-btn"
          title="Cerrar ventana"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center p-4 bg-purple-50 rounded-full mb-4">
             <CreditCard size={32} className="text-purple-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-800">Pago de Reserva</h2>
          <p className="text-gray-500 font-medium mt-1">
            Reserva <span className="text-purple-600 font-bold">#{idReserva}</span>
          </p>
          <div className={`flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-full ${tiempoRestante <= 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            <Clock size={12} />
            <span className="font-bold"> Tiempo restante: {formatTiempo(tiempoRestante)}</span>
          </div>
        </div><br></br>
        
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm idReserva={idReserva} />
        </Elements>

      </div>
    </div>
  );
}