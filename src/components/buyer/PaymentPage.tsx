import React, { useEffect, useState } from 'react';
// import PayfastForm from './PayfastForm';

type Props = {
  amount?: number;
  onSuccess?: () => void;
};

const maskCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const PaymentPage: React.FC<Props> = ({ amount = 0, onSuccess }) => {
  const [method, setMethod] = useState<'payfast' | 'card' | 'bank' | 'jazzcash' | 'easypaisa' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [jazzCashNumber, setJazzCashNumber] = useState('');
  const [easypaisaNumber, setEasypaisaNumber] = useState('');

  useEffect(() => {
    setError(null);
    // Clear all form fields when payment method changes
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setJazzCashNumber('');
    setEasypaisaNumber('');
  }, [method]);

  const handlePayfastCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dummy payment gateway simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success
      const paymentSuccess = Math.random() > 0.1; // 90% success rate
      
      if (paymentSuccess) {
        alert('✅ PayFast Payment Successful!\n\nTransaction ID: PF' + Date.now() + '\nAmount: PKR ' + amount.toLocaleString() + '\n\nThank you for your purchase!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Payment declined by gateway');
      }
    } catch (err: any) {
      setError(err?.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCVV) {
      setError('Please fill in all card details');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Dummy card payment simulation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const paymentSuccess = Math.random() > 0.15; // 85% success rate
      
      if (paymentSuccess) {
        alert('✅ Card Payment Successful!\n\nCard: **** **** **** ' + cardNumber.slice(-4) + '\nAmount: PKR ' + amount.toLocaleString() + '\nTransaction ID: CC' + Date.now() + '\n\nPayment confirmed!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Card declined - insufficient funds');
      }
    } catch (err: any) {
      setError(err?.message || 'Card payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      alert('✅ Bank Transfer Initiated!\n\nBank Details:\nAccount: ArtGallery.pk\nIBAN: PK36MEZN0001234567890123\nAmount: PKR ' + amount.toLocaleString() + '\nReference: BT' + Date.now() + '\n\nInstructions sent to your email!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Bank transfer setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJazzCash = async () => {
    if (!jazzCashNumber) {
      setError('Please enter your JazzCash mobile number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      const paymentSuccess = Math.random() > 0.1;
      
      if (paymentSuccess) {
        alert('✅ JazzCash Payment Successful!\n\nMobile: ' + jazzCashNumber + '\nAmount: PKR ' + amount.toLocaleString() + '\nTransaction ID: JC' + Date.now() + '\n\nPayment confirmed via JazzCash!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Insufficient JazzCash balance');
      }
    } catch (err: any) {
      setError(err?.message || 'JazzCash payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEasypaisa = async () => {
    if (!easypaisaNumber) {
      setError('Please enter your Easypaisa mobile number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      const paymentSuccess = Math.random() > 0.1;
      
      if (paymentSuccess) {
        alert('✅ Easypaisa Payment Successful!\n\nMobile: ' + easypaisaNumber + '\nAmount: PKR ' + amount.toLocaleString() + '\nTransaction ID: EP' + Date.now() + '\n\nPayment confirmed via Easypaisa!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Insufficient Easypaisa balance');
      }
    } catch (err: any) {
      setError(err?.message || 'Easypaisa payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!method) {
      setError('Please select a payment method');
      return;
    }
    if (method === 'payfast') handlePayfastCheckout();
    else if (method === 'card') handleCardPayment();
    else if (method === 'bank') handleBankTransfer();
    else if (method === 'jazzcash') handleJazzCash();
    else if (method === 'easypaisa') handleEasypaisa();
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '2rem'
    }}>
      <style>
        {`
          @media (max-width: 768px) {
            .payment-container {
              padding: 1.5rem !important;
            }
            
            .payment-title {
              font-size: 1.5rem !important;
            }
            
            .payment-methods {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }
          }
        `}
      </style>
      <div style={{ 
        maxWidth: 520, 
        width: '100%',
        padding: 40, 
        borderRadius: 16, 
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(212, 175, 55, 0.3)'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: 10,
          fontSize: '2rem',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #d4af37, #ffd700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Complete Payment
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: 30,
          fontSize: '0.95rem'
        }}>
          Secure payment powered by PayFast
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          marginBottom: 30,
          color: '#fff'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: 5 }}>Total Amount</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>R {Number(amount).toLocaleString()}</div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '3rem'
          }}>💳</div>
        </div>

        <div style={{ 
          padding: '20px',
          background: 'rgba(212, 175, 55, 0.1)',
          borderRadius: 12,
          marginBottom: 20,
          border: '2px solid rgba(212, 175, 55, 0.3)'
        }}>
          <div style={{ marginBottom: 15 }}>
            <strong style={{ color: '#333', marginBottom: 10, display: 'block' }}>Select Payment Method:</strong>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* PayFast Option */}
              <div 
                onClick={() => setMethod('payfast')}
                style={{ 
                  padding: '15px',
                  background: method === 'payfast' ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderRadius: 8,
                  border: method === 'payfast' ? '2px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                <input 
                  type="radio" 
                  checked={method === 'payfast'} 
                  onChange={() => setMethod('payfast')}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#d4af37' }}
                />
                <span style={{ fontSize: '1.5rem' }}>🔐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>PayFast Gateway</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Secure online payment</div>
                </div>
              </div>

              {/* Credit/Debit Card Option */}
              <div 
                onClick={() => setMethod('card')}
                style={{ 
                  padding: '15px',
                  background: method === 'card' ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderRadius: 8,
                  border: method === 'card' ? '2px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                <input 
                  type="radio" 
                  checked={method === 'card'} 
                  onChange={() => setMethod('card')}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#d4af37' }}
                />
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>Credit/Debit Card</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Visa, Mastercard, Amex</div>
                </div>
              </div>

              {/* Bank Transfer Option */}
              <div 
                onClick={() => setMethod('bank')}
                style={{ 
                  padding: '15px',
                  background: method === 'bank' ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderRadius: 8,
                  border: method === 'bank' ? '2px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                <input 
                  type="radio" 
                  checked={method === 'bank'} 
                  onChange={() => setMethod('bank')}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#d4af37' }}
                />
                <span style={{ fontSize: '1.5rem' }}>🏦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>Bank Transfer</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Direct bank payment</div>
                </div>
              </div>

              {/* JazzCash Option */}
              <div 
                onClick={() => setMethod('jazzcash')}
                style={{ 
                  padding: '15px',
                  background: method === 'jazzcash' ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderRadius: 8,
                  border: method === 'jazzcash' ? '2px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                <input 
                  type="radio" 
                  checked={method === 'jazzcash'} 
                  onChange={() => setMethod('jazzcash')}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#d4af37' }}
                />
                <span style={{ fontSize: '1.5rem' }}>📱</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>JazzCash</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Mobile wallet payment</div>
                </div>
              </div>

              {/* Easypaisa Option */}
              <div 
                onClick={() => setMethod('easypaisa')}
                style={{ 
                  padding: '15px',
                  background: method === 'easypaisa' ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderRadius: 8,
                  border: method === 'easypaisa' ? '2px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                <input 
                  type="radio" 
                  checked={method === 'easypaisa'} 
                  onChange={() => setMethod('easypaisa')}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#d4af37' }}
                />
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>Easypaisa</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Mobile wallet payment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Details Form */}
          {method === 'card' && (
            <div style={{ marginTop: 20, padding: 15, background: '#fff', borderRadius: 8 }}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, color: '#333', fontWeight: 600, fontSize: '0.9rem' }}>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                  maxLength={19}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: 8,
                    fontSize: '1rem',
                    outline: 'none',
                    color: '#333',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 5, color: '#333', fontWeight: 600, fontSize: '0.9rem' }}>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/25"
                    value={cardExpiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setCardExpiry(val.length >= 2 ? `${val.slice(0,2)}/${val.slice(2)}` : val);
                    }}
                    maxLength={5}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: 8,
                      fontSize: '1rem',
                      outline: 'none',
                      color: '#333',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 5, color: '#333', fontWeight: 600, fontSize: '0.9rem' }}>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: 8,
                      fontSize: '1rem',
                      outline: 'none',
                      color: '#333',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Number Form for JazzCash/Easypaisa */}
          {method === 'jazzcash' && (
            <div style={{ marginTop: 20, padding: 15, background: '#fff', borderRadius: 8 }}>
              <label style={{ display: 'block', marginBottom: 5, color: '#333', fontWeight: 600, fontSize: '0.9rem' }}>
                JazzCash Mobile Number
              </label>
              <input
                type="text"
                placeholder="03XX-XXXXXXX"
                value={jazzCashNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setJazzCashNumber(val);
                }}
                maxLength={11}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 8,
                  fontSize: '1rem',
                  outline: 'none',
                  color: '#333',
                  backgroundColor: '#fff'
                }}
              />
              <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#666' }}>
                Enter your registered JazzCash number
              </div>
            </div>
          )}

          {method === 'easypaisa' && (
            <div style={{ marginTop: 20, padding: 15, background: '#fff', borderRadius: 8 }}>
              <label style={{ display: 'block', marginBottom: 5, color: '#333', fontWeight: 600, fontSize: '0.9rem' }}>
                Easypaisa Mobile Number
              </label>
              <input
                type="text"
                placeholder="03XX-XXXXXXX"
                value={easypaisaNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setEasypaisaNumber(val);
                }}
                maxLength={11}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 8,
                  fontSize: '1rem',
                  outline: 'none',
                  color: '#333',
                  backgroundColor: '#fff'
                }}
              />
              <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#666' }}>
                Enter your registered Easypaisa number
              </div>
            </div>
          )}

          <div style={{ 
            padding: '15px',
            background: 'rgba(67, 233, 123, 0.1)',
            borderRadius: 8,
            marginTop: 15,
            border: '1px solid rgba(67, 233, 123, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <strong style={{ color: '#333', fontSize: '0.95rem' }}>Secure & Encrypted</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
              • PCI DSS Level 1 Certified<br/>
              • Bank-grade 256-bit SSL encryption<br/>
              • Supports all major cards & payment methods
            </div>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: 15, 
            background: 'rgba(220, 38, 38, 0.1)', 
            color: '#dc2626',
            borderRadius: 8,
            marginBottom: 20,
            border: '2px solid rgba(220, 38, 38, 0.3)',
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <button 
          onClick={handlePayment}
          disabled={loading || !method}
          style={{ 
            width: '100%', 
            padding: 16,
            background: (loading || !method) ? '#999' : 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 18,
            cursor: (loading || !method) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || !method) ? 'none' : '0 10px 30px rgba(212, 175, 55, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          {loading ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
              Processing Payment...
            </>
          ) : (
            <>
              <span>🔒</span>
              Pay R {Number(amount).toLocaleString()} Securely
            </>
          )}
        </button>

        <div style={{ 
          marginTop: 20,
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#888'
        }}>
          🛡️ Your payment information is encrypted and secure
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
