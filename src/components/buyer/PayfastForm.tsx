import React, { useState } from 'react';

type Props = {
  amount: number;
  onSuccess?: () => void;
};

const PayfastForm: React.FC<Props> = ({ amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayfast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4002/api/payfast/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create PayFast transaction');
      if (data.redirectUrl) {
        // Redirect user to PayFast sandbox/checkout
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL returned from server');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#111' }}>You will be redirected to PayFast to complete the payment.</div>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <button onClick={startPayfast} disabled={loading} style={{ padding: 12, background: '#0b1220', color: '#fff', border: 'none', borderRadius: 6 }}>
        {loading ? 'Preparing PayFast...' : `Pay PKR ${Number(amount).toLocaleString()} via PayFast`}
      </button>
    </div>
  );
};

export default PayfastForm;
