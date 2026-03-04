import { motion } from 'framer-motion';
import { Package, Heart, MapPin, Phone, Mail, Edit, Award, RefreshCw, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchOrders } from '../../services/orderService';
import { auth } from '../../firebase';

interface BuyerProfileProps {
  wishlistCount?: number;
  userRole?: 'buyer' | 'seller' | 'admin';
}

export function BuyerProfile({ wishlistCount = 0, userRole = 'buyer' }: BuyerProfileProps) {
  const [user, setUser] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    phone: '+92 300 0000000',
    location: 'Pakistan',
    memberSince: 'December 2025',
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    // Get logged in user data from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        const joinDate = userData.createdAt || 'December 2025';
        const userInfo = {
          name: userData.name || 'User',
          email: userData.email || 'user@example.com',
          phone: userData.phone || '+92 300 0000000',
          location: userData.location || 'Pakistan',
          memberSince: joinDate,
        };
        setUser(userInfo);
        setEditForm({
          name: userInfo.name,
          phone: userInfo.phone,
          location: userInfo.location,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch buyer's orders from database
  useEffect(() => {
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          setOrders([]);
          return;
        }

        // If admin is viewing buyer panel, don't load any data
        if (userRole === 'admin') {
          console.log('🔒 Admin viewing buyer panel - showing demo mode');
          setOrders([]);
          setTotalOrders(0);
          setTotalSpent(0);
          setLoadingOrders(false);
          return;
        }

        const buyerOrders = await fetchOrders();
        console.log('📦 Buyer orders loaded:', buyerOrders.length);
        
        // CRITICAL DEBUG: Log each order's timestamp details
        buyerOrders.forEach((o, idx) => {
          if (idx < 5) { // Log first 5 orders only
            console.log(`Order ${idx + 1} [${o.id.substring(0, 8)}]:`, {
              createdAt: o.createdAt,
              hasCreatedAt: !!o.createdAt,
              type: o.createdAt ? typeof o.createdAt : 'undefined',
              isObject: o.createdAt && typeof o.createdAt === 'object',
              hasToDate: (typeof o.createdAt === 'object' && o.createdAt !== null && 'toDate' in o.createdAt) ? 'YES' : 'NO',
              hasSeconds: (typeof o.createdAt === 'object' && o.createdAt !== null && 'seconds' in o.createdAt) ? 'YES' : 'NO',
            });
          }
        });
        
        // Check for orders without timestamps
        const ordersWithoutTimestamp = buyerOrders.filter(o => !o.createdAt);
        if (ordersWithoutTimestamp.length > 0) {
          console.error('🚨 CRITICAL: Found', ordersWithoutTimestamp.length, 'orders WITHOUT createdAt!');
          console.error('These orders will show unstable timestamps:', 
            ordersWithoutTimestamp.map(o => `${o.id.substring(0, 8)} (Amount: ${o.totalAmount})`));
        }
        
        // Transform database orders to match UI expectations
        const transformedOrders = buyerOrders.map((dbOrder: any, idx: number) => {
          // Get the actual timestamp from database - MUST preserve original time
          let orderDate: string;
          let timestampSource = 'createdAt';
          
          if (dbOrder.createdAt) {
            // Handle Firestore Timestamp or ISO string
            if (typeof dbOrder.createdAt === 'object' && dbOrder.createdAt.toDate) {
              orderDate = dbOrder.createdAt.toDate().toISOString();
            } else if (typeof dbOrder.createdAt === 'object' && dbOrder.createdAt.seconds) {
              orderDate = new Date(dbOrder.createdAt.seconds * 1000).toISOString();
            } else if (typeof dbOrder.createdAt === 'string') {
              orderDate = dbOrder.createdAt;
            } else {
              console.error('🚨 Unknown createdAt format for order:', dbOrder.id.substring(0, 8), dbOrder.createdAt);
              orderDate = '2025-12-15T00:00:00.000Z';
              timestampSource = 'fallback';
            }
          } else if (dbOrder.updatedAt) {
            // Try updatedAt as fallback
            console.warn('⚠️ Order missing createdAt, using updatedAt:', dbOrder.id.substring(0, 8));
            if (typeof dbOrder.updatedAt === 'object' && dbOrder.updatedAt.toDate) {
              orderDate = dbOrder.updatedAt.toDate().toISOString();
            } else if (typeof dbOrder.updatedAt === 'object' && dbOrder.updatedAt.seconds) {
              orderDate = new Date(dbOrder.updatedAt.seconds * 1000).toISOString();
            } else {
              orderDate = dbOrder.updatedAt;
            }
            timestampSource = 'updatedAt';
          } else {
            // Last resort: Use fixed date for this specific order
            console.error('🚨 Order has NO timestamp:', dbOrder.id.substring(0, 8));
            orderDate = `2025-12-14T${String(23 - idx).padStart(2, '0')}:00:00.000Z`;
            timestampSource = 'generated';
          }
          
          if (idx < 3) {
            console.log(`Order ${idx + 1} final date [${timestampSource}]:`, orderDate);
          }
          
          return {
            id: dbOrder.id,
            date: orderDate,
            timestamp: new Date(orderDate).getTime(), // For sorting
            artworks: dbOrder.items?.map((item: any) => ({
              id: item.artworkId,
              title: item.artworkTitle || 'Artwork',
              artist: 'Artist',
              image: item.artworkImage || '',
              price: item.price,
            })) || [],
            total: dbOrder.totalAmount || 0,
            status: dbOrder.paymentStatus === 'completed' ? 'delivered' : 'pending',
            trackingNumber: dbOrder.trackingNumber,
          };
        });
        
        // Sort orders by date - most recent first
        const sortedOrders = transformedOrders.sort((a, b) => b.timestamp - a.timestamp);
        
        // Update all states together to avoid partial updates
        const spent = buyerOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
        
        console.log('💰 Total spent:', spent);
        console.log('✅ Setting orders:', sortedOrders.length, 'items');
        
        // Set all states atomically
        setOrders(sortedOrders);
        setTotalOrders(sortedOrders.length);
        setTotalSpent(spent);
      } catch (error) {
        console.error('❌ Error loading orders:', error);
        setOrders([]);
        setTotalOrders(0);
        setTotalSpent(0);
      } finally {
        console.log('✅ Loading complete, setting loadingOrders to false');
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, [refreshKey, userRole]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      phone: user.phone,
      location: user.location,
    });
  };

  const handleSaveEdit = () => {
    // Update user state
    const updatedUser = {
      ...user,
      name: editForm.name,
      phone: editForm.phone,
      location: editForm.location,
    };
    setUser(updatedUser);

    // Update localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        const updatedUserData = {
          ...userData,
          name: editForm.name,
          phone: editForm.phone,
          location: editForm.location,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        console.log('✅ Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }

    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#43e97b';
      case 'shipped':
        return '#4facfe';
      case 'processing':
        return '#f093fb';
      case 'pending':
        return '#ffa756';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .profile-container {
            padding: 80px 1rem 1rem !important;
          }
          
          .profile-title {
            font-size: 1.75rem !important;
            margin-top: 0.5rem !important;
          }
          
          .profile-card {
            padding: 1.5rem !important;
          }
          
          .user-name {
            font-size: 1.5rem !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          .stat-card {
            padding: 1.5rem !important;
          }
          
          .stat-value {
            font-size: 2rem !important;
          }
          
          .order-history {
            padding: 1.5rem !important;
          }
          
          .section-title {
            font-size: 1.25rem !important;
          }
          
          .order-card {
            padding: 1rem !important;
          }
          
          .order-header {
            flex-direction: column !important;
            gap: 0.5rem !important;
            align-items: flex-start !important;
          }
          
          .order-total {
            font-size: 1rem !important;
          }
          
          .profile-details {
            gap: 1rem !important;
          }
          
          .detail-row {
            flex-direction: row !important;
            align-items: center !important;
          }
          
          .profile-input {
            font-size: 0.875rem !important;
            padding: 0.5rem !important;
          }
        }
      `}</style>
      <div style={styles.container} className="profile-container">
        <div style={styles.header}>
          <h1 style={styles.title} className="profile-title">My Profile</h1>          {userRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(250, 112, 154, 0.2)',
                border: '1px solid rgba(250, 112, 154, 0.4)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginTop: '1rem',
                color: '#fa709a',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              👑 Admin Demo Mode - This is a preview of the buyer profile page. Login as a buyer to see actual data.
            </motion.div>
          )}        </div>

      <div style={styles.content}>
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.profileCard}
        >
          <div style={styles.profileHeader}>
            <div style={styles.profileInfo}>
              <h2 style={styles.userName} className="user-name">{user.name}</h2>
              <p style={styles.memberSince}>Member since {user.memberSince}</p>
              <div style={styles.badge}>
                <Award size={16} />
                VIP Collector
              </div>
            </div>
          </div>

          <div style={styles.profileDetails} className="profile-details">
            {isEditing ? (
              <>
                <div style={styles.detailRow}>
                  <Mail size={20} style={{ color: '#d4af37' }} />
                  <div style={{ flex: 1 }}>
                    <p style={styles.detailLabel}>Name</p>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={styles.input}
                      className="profile-input"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <Phone size={20} style={{ color: '#d4af37' }} />
                  <div style={{ flex: 1 }}>
                    <p style={styles.detailLabel}>Phone</p>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={styles.input}
                      className="profile-input"
                      placeholder="+92 300 0000000"
                    />
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <MapPin size={20} style={{ color: '#d4af37' }} />
                  <div style={{ flex: 1 }}>
                    <p style={styles.detailLabel}>Location</p>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      style={styles.input}
                      className="profile-input"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.detailRow}>
                  <Mail size={20} style={{ color: '#d4af37' }} />
                  <div>
                    <p style={styles.detailLabel}>Email</p>
                    <p style={styles.detailValue}>{user.email}</p>
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <Phone size={20} style={{ color: '#d4af37' }} />
                  <div>
                    <p style={styles.detailLabel}>Phone</p>
                    <p style={styles.detailValue}>{user.phone}</p>
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <MapPin size={20} style={{ color: '#d4af37' }} />
                  <div>
                    <p style={styles.detailLabel}>Location</p>
                    <p style={styles.detailValue}>{user.location}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <motion.div
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  style={{ ...styles.editButton, width: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
                  onClick={handleSaveEdit}
                >
                  <Check size={18} />
                  Save Changes
                </button>
              </motion.div>
              <motion.div
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  style={{ ...styles.editButton, width: '100%', background: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={handleCancelEdit}
                >
                  <X size={18} />
                  Cancel
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                style={styles.editButton}
                onClick={handleEditClick}
              >
                <Edit size={18} />
                Edit Profile
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div style={styles.statsGrid} className="stats-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              ...styles.statCard,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Package size={32} />
            <h3 style={styles.statValue} className="stat-value">{totalOrders}</h3>
            <p style={styles.statLabel}>Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              ...styles.statCard,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            }}
          >
            <Heart size={32} />
            <h3 style={styles.statValue} className="stat-value">{wishlistCount}</h3>
            <p style={styles.statLabel}>Wishlist Items</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              ...styles.statCard,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            }}
          >
            <Award size={32} />
            <h3 style={styles.statValue} className="stat-value">PKR {totalSpent.toLocaleString()}</h3>
            <p style={styles.statLabel}>Total Spent</p>
          </motion.div>
        </div>

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.orderHistory}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={styles.sectionTitle} className="section-title">Order History</h3>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <RefreshCw size={16} style={{ animation: loadingOrders ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </motion.div>
          </div>
          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
              No orders yet
            </div>
          ) : (
            <div style={styles.ordersList}>
              {orders.map((order, index) => (
              <motion.div
                key={`${order.id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                style={styles.orderCard}
                whileHover={{ x: 5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }}
              >
                <div style={styles.orderHeader} className="order-header">
                  <div>
                    <p style={styles.orderId}>Order #{order.id.substring(0, 8)}</p>
                    <p style={styles.orderDate}>
                      {new Date(order.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {(() => {
                        const orderTime = new Date(order.date).getTime();
                        const now = Date.now();
                        const hoursDiff = (now - orderTime) / (1000 * 60 * 60);
                        return hoursDiff < 24 && <span style={{ 
                          marginLeft: '0.5rem', 
                          background: '#43e97b', 
                          color: '#000', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>NEW</span>;
                      })()}
                    </p>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      background: `${getStatusColor(order.status || 'pending')}20`,
                      color: getStatusColor(order.status || 'pending'),
                    }}
                  >
                    {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                  </div>
                </div>

                <div style={styles.orderItems}>
                  {(order.artworks || []).map((artwork: any, artIdx: number) => (
                    <div key={`${artwork.id}-${artIdx}`} style={styles.orderItem}>
                      {artwork.image ? (
                        <img 
                          src={artwork.image} 
                          alt={artwork.title} 
                          style={styles.orderThumbnail}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                            target.style.display = 'flex';
                            target.style.alignItems = 'center';
                            target.style.justifyContent = 'center';
                            target.style.fontSize = '1.5rem';
                            target.src = '';
                            target.alt = '🎨';
                          }}
                        />
                      ) : (
                        <div style={{
                          ...styles.orderThumbnail,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                        }}>
                          🎨
                        </div>
                      )}
                      <div style={styles.orderItemInfo}>
                        <p style={styles.orderItemTitle}>{artwork.title || 'Artwork'}</p>
                        <p style={styles.orderItemArtist}>PKR {(artwork.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.orderFooter}>
                  <span style={styles.orderTotal} className="order-total">PKR {(order.total || 0).toLocaleString()}</span>
                  {order.trackingNumber && (
                    <span style={styles.trackingNumber}>
                      Tracking: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
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
    maxWidth: '1200px',
    margin: '0 auto 2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gap: '2rem',
  },
  profileCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  profileHeader: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #d4af37',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: '#d4af37',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  memberSince: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '1rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  detailRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#fff',
    fontWeight: 500,
  },
  editButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '2rem',
    borderRadius: '1rem',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '1rem 0 0.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
  },
  orderHistory: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1.5rem',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  orderCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  orderId: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  orderDate: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  orderItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  },
  orderItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  orderThumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '0.5rem',
    objectFit: 'cover',
  },
  orderItemInfo: {},
  orderItemTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  orderItemArtist: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  orderTotal: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#d4af37',
  },
  trackingNumber: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
};
