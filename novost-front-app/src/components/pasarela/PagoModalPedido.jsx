import { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import CheckoutFormPedido from './CheckoutFormPedido';
import { X, CreditCard, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Props:
 *   clientSecret   — secret de Stripe para el PaymentIntent
 *   onClose        — llamado cuando el usuario cierra sin pagar (X o timeout)
 *   onPagoExitoso  — llamado por CheckoutFormPedido cuando Stripe confirma el pago
 */
export default function PagoModalPedido({ clientSecret, onClose, onPagoExitoso }) {
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.warning("Tiempo de pago expirado. Por favor, intenta nuevamente.");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onClose]);

  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!clientSecret) return null;

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
          <h2 className="text-3xl font-black text-gray-800">Pago de Pedido</h2>
          <p className="text-gray-500 font-medium mt-1">
            Completa el pago para confirmar tu pedido
          </p>
          <div className={`flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-full ${
            tiempoRestante <= 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <Clock size={12} />
            <span className="font-bold">Tiempo restante: {formatTiempo(tiempoRestante)}</span>
          </div>
        </div><br />

        {/* 
          Le pasamos onPagoExitoso a CheckoutFormPedido para que lo llame 
          cuando Stripe confirme el pago correctamente.
        */}
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <CheckoutFormPedido onPagoExitoso={onPagoExitoso} />
        </Elements>

      </div>
    </div>
  );
}