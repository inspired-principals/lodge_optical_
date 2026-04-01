import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SquarePaymentProps {
  amount: number;
}

export default function SquarePayment({ amount }: SquarePaymentProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const appId = import.meta.env.VITE_SQUARE_APP_ID;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

  if (!appId || !locationId) {
    return (
      <div className="p-6 bg-red-50 text-red-700 border-l-4 border-red-500 flex items-start gap-4">
        <AlertCircle className="shrink-0" />
        <div>
          <h4 className="font-bold mb-1">Configuration Missing</h4>
          <p className="text-sm">
            Square App ID and Location ID are not configured in the environment variables. 
            Please add <code>VITE_SQUARE_APP_ID</code> and <code>VITE_SQUARE_LOCATION_ID</code> to your environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white shadow-xl border-t-4 border-primary-blue">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary-blue uppercase tracking-wider mb-2">Secure Checkout</h3>
        <p className="text-gray-600 text-lg">Total Due: <span className="font-bold text-primary-blue">${amount.toFixed(2)}</span></p>
      </div>
      
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
          <CheckCircle2 size={64} className="text-green-500 mb-4" />
          <h4 className="text-xl font-bold text-primary-blue mb-2">Payment Successful!</h4>
          <p className="text-gray-500">Thank you for your purchase. A receipt will be sent to your email.</p>
        </div>
      ) : (
        <div className="relative">
          <PaymentForm
            applicationId={appId}
            locationId={locationId}
            cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
              setStatus('processing');
              setErrorMessage('');
              try {
                const response = await fetch('/api/payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sourceId: token.token,
                    amount: amount
                  }),
                });
                const data = await response.json();
                if (data.success) {
                  setStatus('success');
                } else {
                  setStatus('error');
                  setErrorMessage(data.error || 'Payment failed. Please try again.');
                }
              } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message || 'An unexpected error occurred.');
              }
            }}
          >
            <CreditCard
              buttonProps={{
                css: {
                  backgroundColor: '#040018',
                  fontSize: '14px',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#b89047',
                  },
                },
              }}
            />
          </PaymentForm>

          {status === 'processing' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-primary-blue z-10">
              <Loader2 className="animate-spin mb-2" size={32} />
              <span className="font-medium">Processing payment...</span>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>Payments are securely processed by Square.</p>
      </div>
    </div>
  );
}
