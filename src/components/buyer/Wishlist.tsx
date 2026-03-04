import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Eye } from 'lucide-react';
import { Artwork } from '../../types';

interface WishlistProps {
  wishlistItems: Artwork[];
  onRemoveItem: (artworkId: string) => void;
  onAddToCart: (artwork: Artwork) => void;
}

export function Wishlist({ wishlistItems, onRemoveItem, onAddToCart }: WishlistProps) {
  return (
    <div style={styles.container}>
      <style>
        {`
          @media (max-width: 768px) {
            .wishlist-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .wishlist-title {
              font-size: 1.75rem !important;
            }
          }
        `}
      </style>
      <div style={styles.header}>
        <h1 style={styles.title} className="wishlist-title">
          <Heart size={32} style={{ color: '#e94560' }} />
          My Wishlist
        </h1>
        <p style={styles.subtitle}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'artwork' : 'artworks'} saved
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.emptyWishlist}
        >
          <Heart size={80} style={{ color: 'rgba(233, 69, 96, 0.3)' }} />
          <h3 style={styles.emptyTitle}>Your wishlist is empty</h3>
          <p style={styles.emptyText}>Save artworks you love for later</p>
        </motion.div>
      ) : (
        <div style={styles.grid} className="wishlist-grid">
          {wishlistItems.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              style={styles.card}
              whileHover={{ y: -10, boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)' }}
            >
              <div style={styles.imageContainer}>
                <img 
                  src={(artwork as any).imageUrl || artwork.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={artwork.title} 
                  style={styles.image}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-icon')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-icon';
                      fallback.style.cssText = 'width: 100%; height: 100%; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 4rem;';
                      fallback.textContent = '🎨';
                      parent.appendChild(fallback);
                    }
                  }}
                />
                <motion.button
                  style={styles.removeButton}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemoveItem(artwork.id)}
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>

              <div style={styles.info}>
                <h3 style={styles.cardTitle}>{artwork.title}</h3>
                <p style={styles.artist}>{artwork.artist}</p>
                <p style={styles.description}>{artwork.description}</p>
                
                <div style={styles.meta}>
                  <span style={styles.category}>{artwork.category}</span>
                  <div style={styles.stats}>
                    <span><Eye size={14} /> {artwork.views}</span>
                    <span><Heart size={14} /> {artwork.likes}</span>
                  </div>
                </div>

                <div style={styles.footer}>
                  <span style={styles.price}>PKR {artwork.price.toLocaleString()}</span>
                  <motion.button
                    style={styles.addButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onAddToCart(artwork);
                      alert(`Added "${artwork.title}" to cart!`);
                    }}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
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
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyWishlist: {
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
  grid: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(233, 69, 96, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  info: {
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  artist: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '0.75rem',
  },
  description: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '1rem',
    lineHeight: 1.6,
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  category: {
    background: 'rgba(212, 175, 55, 0.2)',
    color: '#d4af37',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#d4af37',
  },
  addButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
  },
};
