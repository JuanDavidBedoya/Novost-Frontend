import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import CheckoutForm from './CheckoutForm';
import { X } from 'lucide-react';

export default function PagoModal({ clientSecret, idReserva, onClose }) {
  if (!clientSecret) return null;

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2">Completar Pago</h2>
          <p className="text-gray-600 mb-6 text-sm">Reserva #{idReserva}</p>
          
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm idReserva={idReserva} />
          </Elements>
        </div>
      </div>
    </div>
  );
}