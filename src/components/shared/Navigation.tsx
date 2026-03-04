import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, User, Menu, Search, Bell, X, LogOut, Trash2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationService, Notification } from '../../services/notificationService';
import { auth } from '../../firebase';

interface NavigationProps {
  cartCount?: number;
  wishlistCount?: number;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  isAuthenticated?: boolean; // To control notification visibility
  userRole?: 'buyer' | 'seller' | 'admin'; // Current user role
}

export function Navigation({ cartCount = 0, wishlistCount = 0, onNavigate, currentPage, onLogout, onSearch, isAuthenticated = false, userRole = 'buyer' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    // Only subscribe to notifications if user is authenticated AND is a buyer
    // Admin viewing buyer panel should not see notifications
    if (!isAuthenticated || userRole !== 'buyer') {
      console.log('🔔 User not authenticated or not a buyer, skipping notification subscription');
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsOpen(false);
      return;
    }

    console.log('🔔 Setting up auth state listener for notifications');
    
    // Use onAuthStateChanged to ensure auth is loaded
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('🔔 No user logged in, clearing notifications');
        setNotifications([]);
        setUnreadCount(0);
        setNotificationsOpen(false); // Close notification panel on logout
        return;
      }

      console.log('🔔 User authenticated, subscribing to notifications for:', user.uid);
      const unsubscribeNotifications = notificationService.subscribeToNotifications(
        user.uid,
        (newNotifications) => {
          console.log('🔔 Received notifications:', newNotifications.length);
          setNotifications(newNotifications);
          const unread = newNotifications.filter((n) => !n.read).length;
          setUnreadCount(unread);
          console.log('🔔 Unread count:', unread);
        }
      );

      // Store the unsubscribe function to clean up later
      return () => {
        console.log('🔔 Unsubscribing from notifications');
        unsubscribeNotifications();
      };
    });

    return () => {
      console.log('🔔 Cleaning up auth listener');
      unsubscribeAuth();
    };
  }, [isAuthenticated, userRole]);

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await notificationService.markAllAsRead(user.uid);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'ar-studio', label: 'AR Studio' },
    { id: 'artists', label: 'Artists' },
  ];

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .nav-container {
              padding: 0.75rem 1rem !important;
              gap: 0.5rem !important;
              overflow: visible !important;
            }
            
            .nav-icons {
              display: flex !important;
              gap: 0.5rem !important;
              flex-shrink: 0 !important;
            }
            
            .nav-icons button {
              padding: 0.25rem !important;
            }
            
            .nav-mobile-menu-btn {
              display: flex !important;
              flex-shrink: 0 !important;
            }
            
            .nav-search-container {
              width: auto !important;
              flex: 1 !important;
              max-width: 150px !important;
            }
            
            .nav-search-input {
              font-size: 0.875rem !important;
            }
            
            .nav-logo {
              flex-shrink: 0 !important;
            }
            
            .nav-icon-button {
              padding: 0.5rem !important;
            }
            
            .nav-badge {
              width: 16px !important;
              height: 16px !important;
              font-size: 0.625rem !important;
            }
            
            .notification-panel {
              width: 100% !important;
              max-width: 100vw !important;
              right: 0 !important;
              left: 0 !important;
            }
          }
        `}
      </style>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={styles.nav}
      >
        <div style={styles.container} className="nav-container">
          {/* Logo */}
          <motion.div
            style={styles.logo}
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
          >
            <span style={styles.logoText}>ArtGallery</span>
            <span style={styles.logoDomain}>.Pk</span>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={styles.desktopNav}>
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  style={{
                    ...styles.navLink,
                    ...(currentPage === item.id ? styles.navLinkActive : {}),
                  }}
                  whileHover={{ y: -2 }}
                  onClick={() => onNavigate(item.id)}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <motion.div
            style={styles.searchContainer}
            className="nav-search-container"
            animate={{ width: searchOpen ? '300px' : '200px' }}
          >
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search artworks..."
              style={styles.searchInput}
              className="nav-search-input"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                // Real-time search - trigger on every keystroke
                if (onSearch) {
                  onSearch(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearch) {
                  onSearch(searchQuery);
                }
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </motion.div>

          {/* Icons */}
          <div style={styles.icons} className="nav-icons">
            {!isMobile && (
              <>
                {/* Only show notifications for authenticated users */}
                {isAuthenticated && (
                  <motion.button
                    style={styles.iconButton}
                    className="nav-icon-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && <span style={styles.badge} className="nav-badge">{unreadCount}</span>}
                  </motion.button>
                )}

                <motion.button
                  style={styles.iconButton}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate('wishlist')}
                >
                  <Heart size={22} />
                  {wishlistCount > 0 && <span style={styles.badge}>{wishlistCount}</span>}
                </motion.button>

                <motion.button
                  style={styles.iconButton}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate('cart')}
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                </motion.button>

                <motion.button
                  style={styles.iconButton}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate('profile')}
                >
                  <User size={22} />
                </motion.button>

                {onLogout && (
                  <motion.button
                    style={{
                      ...styles.iconButton,
                      color: '#ffd700',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onLogout}
                    title="Logout"
                  >
                    <LogOut size={22} />
                  </motion.button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.button
              style={styles.mobileMenuButton}
              className="nav-mobile-menu-btn"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          )}
        </div>
      </motion.nav>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.notificationBackdrop}
              onClick={() => setNotificationsOpen(false)}
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              style={styles.notificationPanel}
            >
              <div style={styles.notificationHeader}>
                <h3 style={styles.notificationTitle}>Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    style={styles.markAllReadBtn}
                    onClick={handleMarkAllAsRead}
                  >
                    <Check size={16} />
                    Mark all read
                  </button>
                )}
              </div>

              <div style={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotifications}>
                    <Bell size={48} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        ...styles.notificationItem,
                        ...(notification.read ? {} : styles.notificationItemUnread),
                      }}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div style={styles.notificationIcon}>
                        {notification.type === 'order' && '📦'}
                        {notification.type === 'wishlist' && '❤️'}
                        {notification.type === 'cart' && '🛒'}
                        {notification.type === 'payment' && '💳'}
                        {notification.type === 'general' && '🔔'}
                      </div>
                      
                      <div style={styles.notificationContent}>
                        <h4 style={styles.notificationItemTitle}>{notification.title}</h4>
                        <p style={styles.notificationMessage}>{notification.message}</p>
                        <span style={styles.notificationTime}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <button
                        style={styles.deleteNotificationBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>

                      {!notification.read && <div style={styles.unreadDot} />}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      {mobileMenuOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          style={styles.mobileMenu}
        >
          {/* Navigation Links */}
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={styles.mobileNavLink}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
            >
              {item.label}
            </motion.button>
          ))}
          
          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '1rem 0' }} />
          
          {/* Notifications */}
          {isAuthenticated && (
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navItems.length * 0.1 }}
              style={styles.mobileNavLink}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setMobileMenuOpen(false);
              }}
            >
              <Bell size={20} style={{ marginRight: '0.5rem' }} />
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </motion.button>
          )}
          
          {/* Wishlist */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (navItems.length + 1) * 0.1 }}
            style={styles.mobileNavLink}
            onClick={() => {
              onNavigate('wishlist');
              setMobileMenuOpen(false);
            }}
          >
            <Heart size={20} style={{ marginRight: '0.5rem' }} />
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </motion.button>
          
          {/* Cart */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (navItems.length + 2) * 0.1 }}
            style={styles.mobileNavLink}
            onClick={() => {
              onNavigate('cart');
              setMobileMenuOpen(false);
            }}
          >
            <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
            Cart {cartCount > 0 && `(${cartCount})`}
          </motion.button>
          
          {/* Profile */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (navItems.length + 3) * 0.1 }}
            style={styles.mobileNavLink}
            onClick={() => {
              onNavigate('profile');
              setMobileMenuOpen(false);
            }}
          >
            <User size={20} style={{ marginRight: '0.5rem' }} />
            Profile
          </motion.button>
          
          {/* Logout */}
          {onLogout && (
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (navItems.length + 4) * 0.1 }}
              style={{ ...styles.mobileNavLink, color: '#ffd700' }}
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut size={20} style={{ marginRight: '0.5rem' }} />
              Logout
            </motion.button>
          )}
        </motion.div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    overflow: 'visible',
  },
  logo: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  logoDomain: {
    fontSize: '1rem',
    color: '#d4af37',
    fontWeight: 600,
  },
  desktopNav: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
  },
  navLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'color 0.3s ease',
    padding: '0.5rem 0',
  },
  navLinkActive: {
    color: '#d4af37',
    borderBottom: '2px solid #d4af37',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '2rem',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    color: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '0.9rem',
    width: '100%',
  },
  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    position: 'relative',
    padding: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#d4af37',
    color: '#1a1a2e',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  mobileMenuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  mobileMenu: {
    position: 'fixed',
    top: '60px',
    right: 0,
    width: '100%',
    maxWidth: '300px',
    height: 'calc(100vh - 60px)',
    background: 'rgba(26, 26, 46, 0.98)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
    overflowY: 'auto',
    zIndex: 1001,
  },
  mobileNavLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.125rem',
    fontWeight: 500,
    padding: '1rem 0',
    transition: 'color 0.3s ease',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  notificationBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  notificationPanel: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    width: '400px',
    maxWidth: 'calc(100vw - 40px)',
    maxHeight: '600px',
    background: 'rgba(26, 26, 46, 0.98)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  notificationHeader: {
    padding: '1.25rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
  },
  markAllReadBtn: {
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#d4af37',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  },
  notificationList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
  },
  emptyNotifications: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  notificationItem: {
    position: 'relative',
    padding: '1rem',
    margin: '0.5rem 0',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    border: '1px solid transparent',
  },
  notificationItemUnread: {
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
  },
  notificationIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationItemTitle: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
  },
  notificationMessage: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  deleteNotificationBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    padding: '0.25rem',
    transition: 'color 0.3s ease',
    flexShrink: 0,
  },
  unreadDot: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#d4af37',
    boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
  },
};