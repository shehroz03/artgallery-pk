import { motion } from 'framer-motion';
import { ShoppingCart, Heart, User, Menu, Search, Bell, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavigationProps {
  cartCount?: number;
  wishlistCount?: number;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout?: () => void;
}

export function Navigation({ cartCount = 0, wishlistCount = 0, onNavigate, currentPage, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'ar-studio', label: 'AR Studio' },
    { id: 'artists', label: 'Artists' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={styles.nav}
      >
        <div style={styles.container}>
          {/* Logo */}
          <motion.div
            style={styles.logo}
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
            animate={{ width: searchOpen ? '300px' : '200px' }}
          >
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search artworks..."
              style={styles.searchInput}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </motion.div>

          {/* Icons */}
          <div style={styles.icons}>
            {!isMobile && (
              <>
                <motion.button
                  style={styles.iconButton}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell size={22} />
                  <span style={styles.badge}>3</span>
                </motion.button>

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
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          )}
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          style={styles.mobileMenu}
        >
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
          {onLogout && (
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navItems.length * 0.1 }}
              style={{ ...styles.mobileNavLink, color: '#ffd700' }}
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
            >
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
    border: 'none',
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
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  mobileMenu: {
    position: 'fixed',
    top: '60px',
    right: 0,
    width: '100%',
    maxWidth: '300px',
    background: 'rgba(26, 26, 46, 0.98)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
  },
  mobileNavLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    padding: '0.75rem 0',
    transition: 'color 0.3s ease',
    textAlign: 'left',
  },
};
