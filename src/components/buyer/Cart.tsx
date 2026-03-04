import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { CartItem } from '../../types';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (artworkId: string, quantity: number) => void;
  onRemoveItem: (artworkId: string) => void;
  onCheckout: () => void;
  onProceedToPayment?: () => void;
}

export function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onProceedToPayment }: CartProps) {
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.artwork.price * item.quantity, 0);
  const tax = subtotal * 0.17; // 17% GST
  const shipping = 500; // Flat shipping rate
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      onCheckout();
      setCheckoutSuccess(false);
    }, 3000);
  };

  if (checkoutSuccess) {
    return (
      <div style={styles.container}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.successContainer}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 0.6 }}
            style={styles.successIcon}
          >
            <Check size={64} />
          </motion.div>
          <h2 style={styles.successTitle}>Order Placed Successfully!</h2>
          <p style={styles.successText}>
            Thank you for your purchase. Your order is being processed.
          </p>
          <motion.div style={styles.successAnimation}>
            <motion.div
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={styles.successRing}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="cart-container">
      <style>
        {`
          @media (max-width: 768px) {
            .cart-container {
              padding: 90px 1rem 1rem !important;
            }
            
            .cart-title {
              font-size: 1.75rem !important;
              overflow: visible !important;
              margin-top: 1rem !important;
              flex-direction: column !important;
              text-align: center !important;
              gap: 0.5rem !important;
            }
            
            .cart-subtitle {
              text-align: center !important;
              font-size: 1rem !important;
            }
            
            .cart-content {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
            
            .cart-item {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
              padding: 1rem !important;
            }
            
            .cart-item-image {
              width: 100% !important;
              height: 200px !important;
              max-width: 100% !important;
            }
            
            .cart-item-details {
              width: 100% !important;
            }
            
            .cart-item-title {
              font-size: 1.125rem !important;
            }
            
            .cart-item-actions {
              width: 100% !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
            }
            
            .cart-quantity-control {
              order: 1 !important;
            }
            
            .cart-item-price {
              order: 2 !important;
              font-size: 1.25rem !important;
            }
            
            .cart-remove-button {
              order: 3 !important;
            }
            
            .cart-summary {
              position: relative !important;
              top: auto !important;
            }
            
            .cart-summary-title {
              font-size: 1.25rem !important;
            }
          }
        `}
      </style>
      <div style={styles.header}>
        <h1 style={styles.title} className="cart-title">
          <ShoppingCart size={32} style={{ color: '#d4af37', flexShrink: 0 }} />
          Shopping Cart
        </h1>
        <p style={styles.subtitle} className="cart-subtitle">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.emptyCart}
        >
          <ShoppingCart size={80} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
          <h3 style={styles.emptyTitle}>Your cart is empty</h3>
          <p style={styles.emptyText}>Start adding artworks to your collection</p>
        </motion.div>
      ) : (
        <div style={styles.content} className="cart-content">
          {/* Cart Items */}
          <div style={styles.itemsSection}>
            {cartItems.map((item, index) => (
              <motion.div
                key={item.artwork.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.cartItem}
                className="cart-item"
                whileHover={{ x: 5 }}
              >
                <img src={item.artwork.imageUrl || item.artwork.image} alt={item.artwork.title} style={styles.itemImage} className="cart-item-image" />
                
                <div style={styles.itemDetails} className="cart-item-details">
                  <h3 style={styles.itemTitle} className="cart-item-title">{item.artwork.title}</h3>
                  <p style={styles.itemArtist}>{item.artwork.artist}</p>
                  <p style={styles.itemMeta}>
                    {item.artwork.dimensions.width} × {item.artwork.dimensions.height} {item.artwork.dimensions.unit} • {item.artwork.medium}
                  </p>
                </div>

                <div style={styles.itemActions} className="cart-item-actions">
                  <div style={styles.quantityControl} className="cart-quantity-control">
                    <motion.button
                      style={styles.quantityButton}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onUpdateQuantity(item.artwork.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus size={16} />
                    </motion.button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <motion.button
                      style={styles.quantityButton}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onUpdateQuantity(item.artwork.id, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>

                  <p style={styles.itemPrice} className="cart-item-price">PKR {(item.artwork.price * item.quantity).toLocaleString()}</p>

                  <motion.button
                    style={styles.removeButton}
                    className="cart-remove-button"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemoveItem(item.artwork.id)}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.summary}
            className="cart-summary"
          >
            <h3 style={styles.summaryTitle} className="cart-summary-title">Order Summary</h3>

            <div style={styles.summaryDetails}>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Tax (17% GST)</span>
                <span>PKR {tax.toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>PKR {shipping.toLocaleString()}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={{ ...styles.summaryRow, ...styles.summaryTotal }}>
                <span>Total</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              style={styles.checkoutButton}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (typeof onProceedToPayment === 'function') {
                  onProceedToPayment();
                } else {
                  handleCheckout();
                }
              }}
            >
              Proceed to Checkout
              <ArrowRight size={20} />
            </motion.button>

            <div style={styles.paymentIcons}>
              <div style={styles.paymentIcon}>VISA</div>
              <div style={styles.paymentIcon}>MC</div>
              <div style={styles.paymentIcon}>JCB</div>
              <div style={styles.paymentIcon}>EasyPaisa</div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '80px 1.5rem 2rem',
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 2rem',
    overflow: 'visible',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
    overflow: 'visible',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyCart: {
    maxWidth: '500px',
    margin: '4rem auto',
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cartItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '150px 1fr auto',
    gap: '1.5rem',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  itemImage: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '0.75rem',
    border: '2px solid rgba(212, 175, 55, 0.3)',
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  itemTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fff',
  },
  itemArtist: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  itemMeta: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '1rem',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '9999px',
    padding: '0.5rem',
  },
  quantityButton: {
    background: 'rgba(212, 175, 55, 0.2)',
    color: '#d4af37',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  quantity: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    minWidth: '30px',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#d4af37',
  },
  removeButton: {
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '2rem',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  summaryDetails: {
    marginBottom: '2rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '1rem 0',
  },
  summaryTotal: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
  },
  checkoutButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '1rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '1.5rem',
  },
  paymentIcons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  paymentIcon: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  successContainer: {
    maxWidth: '600px',
    margin: '6rem auto',
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '2rem',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    position: 'relative',
  },
  successIcon: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    color: '#1a1a2e',
  },
  successTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '1rem',
  },
  successText: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  successAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  successRing: {
    width: '120px',
    height: '120px',
    border: '4px solid #d4af37',
    borderRadius: '50%',
  },
};
