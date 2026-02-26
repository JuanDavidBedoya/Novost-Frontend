import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function CheckoutForm({ idReserva }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // A donde redirigir tras el pago
        return_url: `${window.location.origin}/mis-reservas?status=success`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Pago procesado con éxito.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Finalizar Pago</h3>
      <PaymentElement />
      <button 
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? "Procesando..." : "Pagar ahora"}
      </button>
      {message && <div className="mt-4 text-red-500 text-sm">{message}</div>}
    </form>
  );
}