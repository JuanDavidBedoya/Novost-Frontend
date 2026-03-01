import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import CheckoutForm from './CheckoutForm';
import { X, CreditCard } from 'lucide-react';

export default function PagoModal({ clientSecret, idReserva, onClose }) {
  if (!clientSecret) return null;

  // Personalización de la apariencia de Stripe para que combine con Novost
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#8a2be2', // Morado Novost
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
        </div><br></br>
        
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm idReserva={idReserva} />
        </Elements>

      </div>
    </div>
  );
}