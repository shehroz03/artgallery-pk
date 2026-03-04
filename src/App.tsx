import { useState, useEffect } from 'react';
import { Navigation } from './components/shared/Navigation';
import { BuyerHome } from './components/buyer/BuyerHome';
import { Marketplace } from './components/buyer/Marketplace';
// import { ARStudio } from './components/buyer/ARStudio'; // Original version
import { EnhancedARStudio as ARStudio } from './components/buyer/EnhancedARStudio'; // Enhanced 3D version
import { Cart } from './components/buyer/Cart';
import { Wishlist } from './components/buyer/Wishlist';
import { BuyerProfile } from './components/buyer/BuyerProfile';
import { ArtistsGallery } from './components/buyer/ArtistsGallery';
import PaymentPage from './components/buyer/PaymentPage';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BuyerLogin } from './components/auth/BuyerLogin';
import { BuyerSignup } from './components/auth/BuyerSignup';
import { SellerLogin } from './components/auth/SellerLogin';
import { SellerSignup } from './components/auth/SellerSignup';
import { AdminLogin } from './components/auth/AdminLogin';
import { AdminSignup } from './components/auth/AdminSignup';
import { auth } from './firebase';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Artwork, CartItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading3D } from './components/effects/Loading3D';
import { updateArtwork } from './utils/artworksStore';
import { createOrder } from './services/orderService';
import { saveCartToFirestore, getCartFromFirestore, clearCartInFirestore } from './services/cartService';
import { saveWishlistToFirestore, getWishlistFromFirestore } from './services/wishlistService';
import { fetchArtworks } from './services/artworkService';
import { seedDatabase } from './utils/seedDatabase';
import './styles/globals.css';

type Page = 'home' | 'marketplace' | 'ar-studio' | 'cart' | 'payment' | 'wishlist' | 'profile' | 'seller' | 'admin' | 'artists';
type AuthMode = 'role-select' | 'buyer-login' | 'buyer-signup' | 'seller-login' | 'seller-signup' | 'admin-login' | 'admin-signup';

export default function App() {
  // Auto-seed Firestore on first run
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  // Add mobile CSS for panel switcher and panel selector
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 768px) {
        .panel-switcher-mobile {
          bottom: 1rem !important;
          right: 1rem !important;
        }
        .panel-switcher-mobile button {
          padding: 0.75rem 1rem !important;
          font-size: 0.875rem !important;
        }
        .panel-switcher-mobile .switcher-icon {
          font-size: 1rem !important;
        }
        .panel-switcher-mobile .switcher-text {
          font-size: 0.75rem !important;
        }
        .panel-modal-mobile {
          padding: 1.5rem !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          margin: 1rem !important;
        }
        .panel-modal-mobile .modal-title-mobile {
          font-size: 1.75rem !important;
          margin-bottom: 0.5rem !important;
        }
        .panel-modal-mobile .modal-subtitle-mobile {
          font-size: 1rem !important;
          margin-bottom: 1.5rem !important;
        }
        .panel-grid-mobile {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        .panel-button-mobile {
          padding: 1.5rem !important;
        }
        .panel-icon-mobile {
          font-size: 2.5rem !important;
          margin-bottom: 0.75rem !important;
        }
        .panel-title-mobile {
          font-size: 1.25rem !important;
          margin-bottom: 0.5rem !important;
        }
        .panel-description-mobile {
          font-size: 0.875rem !important;
        }
        .modal-footer-mobile {
          font-size: 0.75rem !important;
          margin-top: 1rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    return (localStorage.getItem('currentPage') as Page) || 'home';
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Artwork[]>([]);

  // Cart totals for payment page
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.artwork.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.17; // 17% GST
  const cartShipping = cartItems.length > 0 ? 500 : 0; // Flat shipping when items exist
  const cartTotal = cartSubtotal + cartTax + cartShipping;

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin'>(() => {
    return (localStorage.getItem('userRole') as 'buyer' | 'seller' | 'admin') || 'buyer';
  });
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    return (localStorage.getItem('authMode') as AuthMode) || 'role-select';
  });
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('authMode', authMode);
  }, [authMode]);

  // Firebase Auth State Listener - Load cart/wishlist on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && isAuthenticated && userRole === 'buyer') {
        console.log('🔄 Auth state changed, loading cart and wishlist for:', user.uid);

        try {
          const [cartArtworkIds, wishlistArtworkIds] = await Promise.all([
            getCartFromFirestore(),
            getWishlistFromFirestore()
          ]);

          console.log('📦 Found cart IDs:', cartArtworkIds);
          console.log('❤️ Found wishlist IDs:', wishlistArtworkIds);

          if (cartArtworkIds.length === 0 && wishlistArtworkIds.length === 0) {
            console.log('No items to restore');
            return;
          }

          // Fetch full artwork data
          const allArtworks = await fetchArtworks({ limit: 100 });
          console.log('🎨 Fetched artworks:', allArtworks.length);

          // Map artwork fields to ensure image field is correct
          const formattedArtworks = allArtworks.map(artwork => ({
            ...artwork,
            image: artwork.imageUrl || artwork.image, // Handle both field names
          }));

          // Remove duplicates by ID (keep most recent)
          const mappedArtworks = Array.from(
            formattedArtworks.reduce((map, artwork) => {
              const existing = map.get(artwork.id);
              if (!existing ||
                (artwork.updatedAt && (!existing.updatedAt || artwork.updatedAt > existing.updatedAt))) {
                map.set(artwork.id, artwork);
              }
              return map;
            }, new Map()).values()
          );

          // Restore cart
          if (cartArtworkIds.length > 0) {
            const restoredCart = cartArtworkIds
              .map(id => {
                const artwork = mappedArtworks.find(a => a.id === id);
                if (!artwork) {
                  console.warn('⚠️ Artwork not found for cart ID:', id);
                  return null;
                }
                console.log('📦 Restored artwork:', artwork.title, 'Image:', artwork.image);
                return {
                  artwork,
                  quantity: 1
                };
              })
              .filter(Boolean) as CartItem[];
            console.log('✅ Restored cart items:', restoredCart.length);
            setCartItems(restoredCart);
          }

          // Restore wishlist
          if (wishlistArtworkIds.length > 0) {
            const restoredWishlist = wishlistArtworkIds
              .map(id => {
                const artwork = mappedArtworks.find(a => a.id === id);
                if (!artwork) {
                  console.warn('⚠️ Artwork not found for wishlist ID:', id);
                  return null;
                }
                console.log('❤️ Restored artwork:', artwork.title, 'Image:', artwork.image);
                return artwork;
              })
              .filter(Boolean) as Artwork[];
            console.log('✅ Restored wishlist items:', restoredWishlist.length);
            setWishlistItems(restoredWishlist);
          }
        } catch (error) {
          console.error('❌ Error loading cart/wishlist on auth change:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, userRole]);

  // Authentication Functions (unused - kept for reference)
  /*
  const handleLogin = async (email: string, password: string, role: string) => {
    try {
      // Only allow admin login with specific credentials
      if (role === 'admin') {
        const adminEmail = 'admin@artgallery.pk';
        const adminPassword = 'SuperSecret123!';
        if (email !== adminEmail || password !== adminPassword) {
          alert('Only the official admin can log in to the admin panel.');
          return;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const signedInUser = userCredential.user;

      // Retrieve role from local users list if present (keeps backward compatibility)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existing = users.find((u: any) => u.email === email);
      const actualRole = existing ? existing.role : role;

      // If not admin, block access to admin panel
      if (actualRole === 'admin' && (email !== 'admin@artgallery.pk' || password !== 'SuperSecret123!')) {
        alert('Access denied. Only the official admin can log in.');
        return;
      }

      setIsAuthenticated(true);
      setUserRole(actualRole as 'buyer' | 'seller' | 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', actualRole);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ uid: signedInUser.uid, email: signedInUser.email, role: actualRole, name: existing?.name || '' })
      );

      // Load cart and wishlist from Firestore for buyers
      if (actualRole === 'buyer') {
        // Use setTimeout to ensure auth.currentUser is set after Firebase auth completes
        setTimeout(async () => {
          try {
            console.log('Loading cart and wishlist from Firestore...');
            console.log('Current user:', auth.currentUser?.uid);
            
            const [cartArtworkIds, wishlistArtworkIds] = await Promise.all([
              getCartFromFirestore(),
              getWishlistFromFirestore()
            ]);

            console.log('Found cart IDs:', cartArtworkIds.length);
            console.log('Found wishlist IDs:', wishlistArtworkIds.length);

            // Fetch full artwork data
            const allArtworks = await fetchArtworks({ limit: 100 });
            console.log('Fetched artworks:', allArtworks.length);
            
            // Restore cart
            if (cartArtworkIds.length > 0) {
              const restoredCart = cartArtworkIds
                .map(id => {
                  const artwork = allArtworks.find(a => a.id === id);
                  return artwork ? { artwork, quantity: 1 } : null;
                })
                .filter(Boolean) as CartItem[];
              console.log('✅ Restored cart items:', restoredCart.length);
              setCartItems(restoredCart);
            } else {
              console.log('No cart items to restore');
              setCartItems([]);
            }

            // Restore wishlist
            if (wishlistArtworkIds.length > 0) {
              const restoredWishlist = wishlistArtworkIds
                .map(id => allArtworks.find(a => a.id === id))
                .filter(Boolean) as Artwork[];
              console.log('✅ Restored wishlist items:', restoredWishlist.length);
              setWishlistItems(restoredWishlist);
            } else {
              console.log('No wishlist items to restore');
              setWishlistItems([]);
            }
          } catch (error) {
            console.error('❌ Error loading cart/wishlist:', error);
          }
        }, 500); // Wait 500ms for Firebase auth to fully initialize
      }

      if (actualRole === 'seller') setCurrentPage('seller');
      else if (actualRole === 'admin') setCurrentPage('admin');
      else setCurrentPage('home');
    } catch (err: any) {
      const message = err?.message || 'Invalid credentials';
      alert(message);
    }
  };

  const handleSignup = async (name: string, email: string, password: string, role: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // also store metadata locally (role, name) for demo/demo permissions
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        alert('User already exists');
        return;
      }

      const newUser = { name, email, password, role, uid: createdUser.uid };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Auto login after signup
      setIsAuthenticated(true);
      setUserRole(role as 'buyer' | 'seller' | 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('currentUser', JSON.stringify({ uid: createdUser.uid, name, email, role }));

      if (role === 'seller') setCurrentPage('seller');
      else if (role === 'admin') setCurrentPage('admin');
      else setCurrentPage('home');
    } catch (err: any) {
      const message = err?.message || 'Signup failed';
      alert(message);
    }
  };
  */

  const handleLogout = async () => {
    // Save cart and wishlist to Firestore before logout
    if (userRole === 'buyer' && isAuthenticated) {
      try {
        console.log('Saving cart and wishlist before logout:', cartItems.length, wishlistItems.length);
        await Promise.all([
          saveCartToFirestore(cartItems),
          saveWishlistToFirestore(wishlistItems)
        ]);
        console.log('Cart and wishlist saved successfully');
      } catch (error) {
        console.error('Error saving cart/wishlist on logout:', error);
      }
    }

    setIsAuthenticated(false);
    setUserRole('buyer');
    setCurrentPage('home');
    setAuthMode('role-select');
    setCartItems([]);
    setWishlistItems([]);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.setItem('authMode', 'role-select');
  };

  // Cart Management
  const handleAddToCart = (artwork: Artwork) => {
    // Increment views when adding to cart
    updateArtwork(artwork.id, { views: (artwork.views || 0) + 1 });

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.artwork.id === artwork.id);
      const isNewItem = !existingItem;
      const updatedItems = existingItem
        ? prevItems.map((item) =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        : [...prevItems, { artwork, quantity: 1 }];

      // Save to Firestore with notification only for new items
      if (isAuthenticated && userRole === 'buyer') {
        saveCartToFirestore(updatedItems, isNewItem, artwork.title).catch(err =>
          console.error('Error saving cart:', err)
        );
      }

      return updatedItems;
    });
  };

  const handleUpdateQuantity = (artworkId: string, quantity: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.artwork.id === artworkId ? { ...item, quantity } : item
      );

      // Save to Firestore
      if (isAuthenticated && userRole === 'buyer') {
        saveCartToFirestore(updatedItems).catch(err =>
          console.error('Error saving cart:', err)
        );
      }

      return updatedItems;
    });
  };

  const handleRemoveFromCart = (artworkId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.artwork.id !== artworkId);

      // Save to Firestore
      if (isAuthenticated && userRole === 'buyer') {
        saveCartToFirestore(updatedItems).catch(err =>
          console.error('Error saving cart:', err)
        );
      }

      return updatedItems;
    });
  };

  const handleCheckout = async () => {
    try {
      // Create order in database
      if (cartItems.length > 0) {
        const orderItems = cartItems.map(item => ({
          artworkId: item.artwork.id,
          artworkTitle: item.artwork.title,
          artworkImage: item.artwork.image,
          quantity: item.quantity,
          price: item.artwork.price,
          sellerId: item.artwork.sellerId || '',
        }));

        await createOrder({
          items: orderItems,
          totalAmount: cartTotal,
          shippingAddress: {
            street: 'Default Address',
            city: 'Default City',
            state: 'Default State',
            country: 'Pakistan',
            zipCode: '00000',
          },
          paymentMethod: 'PayFast',
        });

        console.log('Order created successfully');
      }

      // Clear cart from Firestore
      if (isAuthenticated && userRole === 'buyer') {
        await clearCartInFirestore();
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      // Still clear cart even if order creation fails (for better UX)
    } finally {
      setCartItems([]);
      setCurrentPage('home');
    }
  };

  // Wishlist Management
  const handleAddToWishlist = (artwork: Artwork) => {
    setWishlistItems((prevItems) => {
      if (prevItems.find((item) => item.id === artwork.id)) {
        return prevItems;
      }
      // Increment likes count in the artwork
      updateArtwork(artwork.id, { likes: (artwork.likes || 0) + 1 });

      const updatedItems = [...prevItems, artwork];

      // Save to Firestore with notification
      if (isAuthenticated && userRole === 'buyer') {
        saveWishlistToFirestore(updatedItems, true, artwork.title).catch(err =>
          console.error('Error saving wishlist:', err)
        );
      }

      return updatedItems;
    });
  };

  const handleRemoveFromWishlist = (artworkId: string) => {
    setWishlistItems((prevItems) => {
      const artwork = prevItems.find((item) => item.id === artworkId);
      if (artwork) {
        // Decrement likes count in the artwork
        updateArtwork(artworkId, { likes: Math.max(0, (artwork.likes || 0) - 1) });
      }

      const updatedItems = prevItems.filter((item) => item.id !== artworkId);

      // Save to Firestore
      if (isAuthenticated && userRole === 'buyer') {
        saveWishlistToFirestore(updatedItems).catch(err =>
          console.error('Error saving wishlist:', err)
        );
      }

      return updatedItems;
    });
  };

  // Role-Based Page Access Control
  const roleAllowedPages: Record<'buyer' | 'seller' | 'admin', Page[]> = {
    buyer: ['home', 'marketplace', 'ar-studio', 'cart', 'wishlist', 'profile', 'artists'],
    seller: ['seller'],
    admin: ['home', 'marketplace', 'ar-studio', 'cart', 'payment', 'wishlist', 'profile', 'seller', 'admin', 'artists'], // Admin has access to all pages
  };

  // Navigation with Role Enforcement
  const handleNavigate = (page: string) => {
    const targetPage = page as Page;

    // If authenticated, enforce role-based access
    if (isAuthenticated) {
      // Only admin can access admin panel
      if (targetPage === 'admin' && userRole !== 'admin') {
        alert('Access Denied: Only the admin can access the admin panel.');
        setIsAuthenticated(false);
        setUserRole('buyer');
        setCurrentPage('home');
        setAuthMode('role-select');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentPage', 'home');
        return;
      }
      const allowedPages = roleAllowedPages[userRole];
      if (!allowedPages.includes(targetPage)) {
        alert(`Access Denied: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} can only access their own pages. Please logout and login with the correct role.`);
        return;
      }
    }

    setCurrentPage(targetPage);
    localStorage.setItem('currentPage', targetPage);
  };

  // Panel Selector (for demo purposes)
  const [showPanelSelector, setShowPanelSelector] = useState(true);

  return (
    <div style={styles.app}>
      {/* 3D Loading Animation on Reload */}
      <Loading3D />

      {/* Panel Selector Modal - Only admin can see and use */}
      <AnimatePresence>
        {showPanelSelector && isAuthenticated && userRole === 'admin' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalBackdrop}
              onTap={() => setShowPanelSelector(false)}
            >
              <div className="panel-modal-mobile">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  style={styles.panelModal}
                  onTap={(e) => e.stopPropagation()}
                >
                  <h2 style={styles.modalTitle} className="modal-title-mobile">Welcome to ArtGallery.Pk</h2>
                  <p style={styles.modalSubtitle} className="modal-subtitle-mobile">Choose your panel to explore</p>
                  <div style={styles.panelGrid} className="panel-grid-mobile">
                    <div className="panel-button-mobile">
                      <motion.button
                        style={{
                          ...styles.panelButton,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onTap={() => {
                          setCurrentPage('home');
                          setShowPanelSelector(false);
                        }}
                      >
                        <div style={styles.panelIcon} className="panel-icon-mobile">🎨</div>
                        <h3 style={styles.panelTitle} className="panel-title-mobile">Buyer Panel</h3>
                        <p style={styles.panelDescription} className="panel-description-mobile">
                          Browse artworks, use AR try-on, and shop
                        </p>
                      </motion.button>
                    </div>
                    <div className="panel-button-mobile">
                      <motion.button
                        style={{
                          ...styles.panelButton,
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onTap={() => {
                          setCurrentPage('seller');
                          setShowPanelSelector(false);
                        }}
                      >
                        <div style={styles.panelIcon} className="panel-icon-mobile">💼</div>
                        <h3 style={styles.panelTitle} className="panel-title-mobile">Seller Panel</h3>
                        <p style={styles.panelDescription} className="panel-description-mobile">
                          Manage your artworks and track sales
                        </p>
                      </motion.button>
                    </div>
                    <div className="panel-button-mobile">
                      <motion.button
                        style={{
                          ...styles.panelButton,
                          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onTap={() => {
                          setCurrentPage('admin');
                          setShowPanelSelector(false);
                        }}
                      >
                        <div style={styles.panelIcon} className="panel-icon-mobile">👑</div>
                        <h3 style={styles.panelTitle} className="panel-title-mobile">Admin Panel</h3>
                        <p style={styles.panelDescription} className="panel-description-mobile">
                          Platform management and analytics
                        </p>
                      </motion.button>
                    </div>
                  </div>
                  <p style={styles.modalFooter} className="modal-footer-mobile">
                    You can switch panels anytime using the navigation
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      {currentPage !== 'seller' && currentPage !== 'admin' && (
        <Navigation
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlistItems.length}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onSearch={(query) => {
            setGlobalSearchQuery(query);
            if (currentPage !== 'marketplace') {
              setCurrentPage('marketplace');
            }
          }}
        />
      )}

      {/* Panel Switcher - Only admin can see and use */}
      {isAuthenticated && userRole === 'admin' && (
        <div className="panel-switcher-mobile">
          <motion.div
            style={styles.panelSwitcher}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              style={styles.switcherButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onTap={() => setShowPanelSelector(true)}
            >
              <span className="switcher-icon" style={styles.switcherIcon}>🔄</span>
              <span className="switcher-text" style={styles.switcherText}>Switch Panel</span>
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${isAuthenticated}-${authMode}-${currentPage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {!isAuthenticated ? (
            authMode === 'role-select' ? (
              <div style={styles.roleSelectContainer}>
                <motion.div style={styles.roleSelectCard}>
                  <h1 style={styles.roleSelectTitle}>Welcome to ArtGallery.Pk</h1>
                  <p style={styles.roleSelectSubtitle}>Select your role to continue</p>

                  <div style={styles.roleButtonGroup}>
                    <motion.button
                      onTap={() => setAuthMode('buyer-login')}
                      style={{
                        ...styles.roleSelectButton,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span style={styles.roleEmoji}>🎨</span>
                      <span style={styles.roleName}>Buyer</span>
                      <span style={styles.roleSignupHint}>Login / Sign up</span>
                    </motion.button>

                    <motion.button
                      onTap={() => setAuthMode('seller-login')}
                      style={{
                        ...styles.roleSelectButton,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span style={styles.roleEmoji}>💼</span>
                      <span style={styles.roleName}>Seller</span>
                      <span style={styles.roleSignupHint}>Login / Sign up</span>
                    </motion.button>

                    <motion.button
                      onTap={() => setAuthMode('admin-login')}
                      style={{
                        ...styles.roleSelectButton,
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span style={styles.roleEmoji}>👑</span>
                      <span style={styles.roleName}>Admin</span>
                      <span style={styles.roleSignupHint}>Login / Sign up</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            ) : authMode === 'buyer-login' ? (
              <BuyerLogin
                onAuthSuccess={() => {
                  setIsAuthenticated(true);
                  setUserRole('buyer');
                  setCurrentPage('home');
                }}
                onSwitchRole={() => setAuthMode('role-select')}
                onSwitchToSignup={() => setAuthMode('buyer-signup')}
              />
            ) : authMode === 'buyer-signup' ? (
              <BuyerSignup
                onAuthSuccess={() => {
                  setIsAuthenticated(true);
                  setUserRole('buyer');
                  setCurrentPage('home');
                }}
                onSwitchRole={() => setAuthMode('role-select')}
                onSwitchToLogin={() => setAuthMode('buyer-login')}
              />
            ) : authMode === 'seller-login' ? (
              <SellerLogin
                onAuthSuccess={() => {
                  setIsAuthenticated(true);
                  setUserRole('seller');
                  setCurrentPage('seller');
                }}
                onSwitchRole={() => setAuthMode('role-select')}
                onSwitchToSignup={() => setAuthMode('seller-signup')}
              />
            ) : authMode === 'seller-signup' ? (
              <SellerSignup
                onAuthSuccess={() => {
                  setIsAuthenticated(true);
                  setUserRole('seller');
                  setCurrentPage('seller');
                }}
                onSwitchRole={() => setAuthMode('role-select')}
                onSwitchToLogin={() => setAuthMode('seller-login')}
              />
            ) : authMode === 'admin-login' ? (
              <AdminLogin
                onAuthSuccess={() => {
                  setIsAuthenticated(true);
                  setUserRole('admin');
                  setCurrentPage('admin');
                }}
                onSwitchRole={() => setAuthMode('role-select')}
                onSwitchToSignup={() => setAuthMode('admin-signup')}
              />
            ) : (
              <AdminSignup
                onAuthSuccess={() => {
                  setIsAuthenticated(true);
                  setUserRole('admin');
                  setCurrentPage('admin');
                }}
                onSwitchRole={() => setAuthMode('role-select')}
                onSwitchToLogin={() => setAuthMode('admin-login')}
              />
            )
          ) : (
            (() => {
              switch (currentPage) {
                case 'home':
                  return <BuyerHome onNavigate={handleNavigate} />;
                case 'marketplace':
                  return (
                    <Marketplace
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      externalSearchQuery={globalSearchQuery}
                      onSearchQueryChange={setGlobalSearchQuery}
                    />
                  );
                case 'ar-studio':
                  return (
                    <ARStudio
                      onNavigate={handleNavigate}
                      onAddToCart={handleAddToCart}
                    />
                  );
                case 'cart':
                  return (
                    <Cart
                      cartItems={cartItems}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveFromCart}
                      onCheckout={handleCheckout}
                      onProceedToPayment={() => setCurrentPage('payment')}
                    />
                  );
                case 'payment':
                  return (
                    <PaymentPage
                      // pass cart summary and amount
                      amount={cartTotal}
                      onSuccess={() => {
                        // After successful payment, complete checkout and navigate home
                        handleCheckout();
                        setCurrentPage('home');
                      }}
                    />
                  );
                case 'wishlist':
                  return (
                    <Wishlist
                      wishlistItems={wishlistItems}
                      onRemoveItem={handleRemoveFromWishlist}
                      onAddToCart={handleAddToCart}
                    />
                  );
                case 'profile':
                  return <BuyerProfile wishlistCount={userRole === 'buyer' ? wishlistItems.length : 0} userRole={userRole} />;
                case 'artists':
                  return <ArtistsGallery />;
                case 'seller':
                  return <SellerDashboard onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthenticated(false); }} onLogout={handleLogout} />;
                case 'admin':
                  return <AdminDashboard onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthenticated(false); }} onLogout={handleLogout} />;
                default:
                  return (
                    <div style={styles.comingSoon}>
                      <h2 style={styles.comingSoonTitle}>Coming Soon</h2>
                      <p style={styles.comingSoonText}>This feature is under development</p>
                    </div>
                  );
              }
            })()
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    background: '#1a1a2e',
    position: 'relative',
  },
  roleSelectContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '2rem',
  },
  roleSelectCard: {
    background: 'rgba(26, 26, 46, 0.95)',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '2rem',
    padding: '3rem',
    maxWidth: '900px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
  roleSelectTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
    background: 'linear-gradient(90deg, #d4af37, #ffd700, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  roleSelectSubtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '2rem',
  },
  roleButtonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  roleSelectButton: {
    padding: '2rem',
    borderRadius: '1rem',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  roleEmoji: {
    fontSize: '3rem',
  },
  roleName: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  roleSignupHint: {
    fontSize: '0.75rem',
    opacity: 0.8,
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  panelModal: {
    background: 'rgba(26, 26, 46, 0.95)',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '2rem',
    padding: '3rem',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    zIndex: 2001,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    textAlign: 'center',
    marginBottom: '0.5rem',
    background: 'linear-gradient(90deg, #d4af37, #ffd700, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  modalSubtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  panelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  panelButton: {
    padding: '2rem',
    borderRadius: '1rem',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
  },
  panelIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  panelTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  panelDescription: {
    fontSize: '0.875rem',
    opacity: 0.9,
    lineHeight: 1.6,
  },
  modalFooter: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  panelSwitcher: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 1500,
  },
  switcherButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '1rem 1.5rem',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4)',
  } as React.CSSProperties,
  switcherIcon: {
    fontSize: '1.25rem',
  } as React.CSSProperties,
  switcherText: {
    fontSize: '0.875rem',
  } as React.CSSProperties,
  comingSoon: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  comingSoonTitle: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#d4af37',
    marginBottom: '1rem',
  },
  comingSoonText: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
};


