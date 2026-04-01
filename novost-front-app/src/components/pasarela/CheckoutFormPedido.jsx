import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

// ✅ Sin props requeridas — el éxito se maneja vía return_url
export default function CheckoutFormPedido() {
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
        // ✅ Redirige siempre a /pedidos con status=success
        // MisPedidos detecta este parámetro y refresca la lista
        return_url: `${window.location.origin}/pedidos?status=success`,
      },
    });

    if (error) {
      setMessage(error.message);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
        <PaymentElement />
      </div><br />

      <button
        disabled={isProcessing || !stripe || !elements}
        className="btn-novost w-full"
        style={{ padding: '1.2rem', fontSize: '1.1rem', justifyContent: 'center' }}
      >
        {isProcessing ? "Procesando pago..." : "Confirmar y Pagar"}
      </button><br />

      {message && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
          {message}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
        <ShieldCheck size={16} className="text-green-500" /> Pagos seguros por Stripe
      </div>
    </form>
  );
}