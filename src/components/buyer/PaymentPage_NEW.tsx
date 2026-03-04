import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import PayFastCheckout from './PayFastCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface PaymentPageProps {
  orderId?: string;
  amount?: number;
  artworkTitle?: string;
  artworkId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  orderId,
  amount = 0,
  artworkTitle = 'Artwork Purchase',
  artworkId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const initiatePayment = async () => {
    if (!auth.currentUser) {
      setError('Please login to continue with payment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // DUMMY PAYMENT - Direct Firestore order creation
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      
      // Create order if not provided
      let finalOrderId = orderId;
      
      if (!finalOrderId && artworkId) {
        // Create order directly in Firestore
        const orderRef = await addDoc(collection(db, 'orders'), {
          buyerId: auth.currentUser.uid,
          buyerEmail: auth.currentUser.email,
          items: [{
            artworkId: artworkId,
            artworkTitle: artworkTitle,
            quantity: 1,
            price: amount
          }],
          totalAmount: amount,
          shippingAddress: {
            street: 'Default Address',
            city: 'Karachi',
            state: 'Sindh',
            country: 'Pakistan',
            zipCode: '75500'
          },
          paymentStatus: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        finalOrderId = orderRef.id;
      }

      // DUMMY PAYMENT DATA - No backend needed!
      const dummyPaymentData = {
        merchant_id: 'DUMMY_MERCHANT',
        merchant_key: 'DUMMY_KEY',
        amount: amount.toFixed(2),
        item_name: artworkTitle,
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`,
        notify_url: `${window.location.origin}/payment-notify`,
        name_first: auth.currentUser.displayName || 'Customer',
        email_address: auth.currentUser.email || '',
        m_payment_id: finalOrderId || `ORDER-${Date.now()}`,
      };

      setPaymentData({
        paymentData: dummyPaymentData,
        paymentUrl: '#dummy-payment' // Dummy URL
      });
      setShowCheckout(true);

    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCheckout(false);
    setPaymentData(null);
    if (onCancel) {
      onCancel();
    }
  };

  // Show PayFast checkout if payment data is ready
  if (showCheckout && paymentData) {
    return (
      <PayFastCheckout
        paymentData={paymentData.paymentData}
        paymentUrl={paymentData.paymentUrl}
        autoSubmit={false}
        onCancel={handleCancel}
      />
    );
  }

  // Show payment initiation page
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .payment-card {
            padding: 1rem !important;
          }
          .payment-title {
            font-size: 1.5rem !important;
          }
          .payment-amount {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl payment-card">
          <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold payment-title">Payment Summary</CardTitle>
          <CardDescription>
            Review your order details before proceeding
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Item:</span>
                <span className="font-medium text-slate-900">{artworkTitle}</span>
              </div>
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Order ID:</span>
                  <span className="font-medium text-slate-900">{orderId}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600 payment-amount">
                    R {Number(amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Button */}
          <Button
            onClick={initiatePayment}
            disabled={loading || amount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay with PayFast
              </>
            )}
          </Button>

          {/* Cancel Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>

          {/* Payment Info */}
          <div className="pt-4 border-t border-slate-200">
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Accepted Payment Methods:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Credit & Debit Cards</li>
                <li>Instant EFT</li>
                <li>Bank Transfer</li>
                <li>Mobile Money</li>
              </ul>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-slate-500">
            <p>🔒 Secure payment processing powered by PayFast</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PaymentPage;
