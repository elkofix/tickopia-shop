'use client';

import { useEffect } from 'react';

interface StripeRedirectProps {
  sessionUrl: string;
}

export default function StripeRedirect({ sessionUrl }: StripeRedirectProps) {
  useEffect(() => {
    if (sessionUrl) {
      console.log('🔗 Redirigiendo a Stripe:', sessionUrl);
      window.location.href = sessionUrl;
    } else {
      console.error('❌ No se proporcionó una URL de sesión válida');
    }
  }, [sessionUrl]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Redirigiendo a Stripe...</p>
    </div>
  );
}