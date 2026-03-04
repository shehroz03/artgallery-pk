import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  email_address?: string;
  name_first?: string;
  name_last?: string;
  signature: string;
}

interface PayFastCheckoutProps {
  paymentData: PayFastPaymentData;
  paymentUrl: string;
  autoSubmit?: boolean;
  onCancel?: () => void;
}

const PayFastCheckout: React.FC<PayFastCheckoutProps> = ({ 
  paymentData, 
  paymentUrl,
  autoSubmit = false,
  onCancel
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [processing, setProcessing] = React.useState(false);

  useEffect(() => {
    if (autoSubmit) {
      // Auto-process dummy payment after 1 second
      setTimeout(() => {
        handleDummyPayment();
      }, 1000);
    }
  }, [autoSubmit]);

  const handleDummyPayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Update order status in Firestore
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../firebase');
        
        await updateDoc(doc(db, 'orders', paymentData.m_payment_id), {
          paymentStatus: 'completed',
          paymentMethod: 'dummy-payfast',
          paidAt: new Date().toISOString(),
          paymentId: `PAY-DUMMY-${Date.now()}`
        });
        
        // Redirect to success page
        window.location.href = paymentData.return_url;
      } catch (error) {
        console.error('Payment processing error:', error);
        alert('Payment failed. Please try again.');
        setProcessing(false);
      }
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDummyPayment();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Payment</CardTitle>
          <CardDescription>
            You will be securely redirected to PayFast to complete your purchase
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Order ID:</span>
                <span className="font-medium text-slate-900">{paymentData.m_payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Item:</span>
                <span className="font-medium text-slate-900">{paymentData.item_name}</span>
              </div>
              {paymentData.item_description && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Description:</span>
                  <span className="font-medium text-slate-900 text-right">{paymentData.item_description}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R {Number(paymentData.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dummy Payment Button */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Action Buttons */}
            <div className="space-y-3">
              {!processing ? (
                <>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
                    disabled={processing}
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Complete Payment (Dummy)
                  </Button>
                  
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={onCancel}
                      disabled={processing}
                    >
                      Cancel Payment
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <p className="text-slate-600 font-medium">Processing Payment...</p>
                  <p className="text-sm text-slate-500">Please wait, completing your order</p>
                </div>
              )}
            </div>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-slate-900">Secure Payment</p>
                <p className="text-xs">
                  Your payment is processed securely by PayFast. We never store your card details.
                  All transactions are encrypted and PCI DSS compliant.
                </p>
              </div>
            </div>
          </div>

          {/* PayFast Logo */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">Powered by PayFast</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayFastCheckout;
