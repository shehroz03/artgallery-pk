import { motion } from 'framer-motion';
import { Users, Image, ShoppingCart, DollarSign, Activity, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService, AdminStats, User } from '../../services/adminService';
import { Artwork } from '../../types';

interface AdminDashboardProps {
  onOpenAuth?: (mode: 'admin-login' | 'admin-signup') => void;
  onLogout?: () => void;
}

export function AdminDashboard({ onOpenAuth, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalArtworks: 0,
    totalOrders: 0,
    revenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    recentActivity: [],
  });
  const [managementView, setManagementView] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  const deleteUser = async (userId: string) => {
    // Debug: Check current user email
    const { auth } = await import('../../firebase');
    const currentUser = auth.currentUser;
    console.log('🔍 Current admin email:', currentUser?.email);
    console.log('🔍 Current user UID:', currentUser?.uid);
    
    if (!currentUser) {
      alert('You must be logged in as admin to delete users');
      return;
    }
    
    if (confirm('Are you sure you want to delete this user? This will also delete all their artworks and cannot be undone.')) {
      const success = await adminService.deleteUser(userId);
      if (success) {
        // Refresh data
        loadAdminData();
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user. Make sure you are logged in with an admin account (role: admin in database).');
      }
    }
  };

  const deleteArtworkAdmin = async (artworkId: string) => {
    if (confirm('Are you sure you want to delete this artwork?')) {
      const success = await adminService.deleteArtwork(artworkId);
      if (success) {
        // Refresh data
        loadAdminData();
        alert('Artwork deleted successfully');
      } else {
        alert('Failed to delete artwork');
      }
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = allUsers.find(u => u.uid === userId);
    if (!user) return;

    const newStatus = !user.disabled;
    const success = await adminService.toggleUserStatus(userId, newStatus);
    
    if (success) {
      // Update local state
      setAllUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === userId ? { ...u, disabled: newStatus } : u
        )
      );
      alert(`User ${newStatus ? 'disabled' : 'enabled'} successfully`);
    } else {
      alert('Failed to update user status');
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading admin data...');
      
      const [statsData, users, artworks] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllUsers(),
        adminService.getAllArtworks(),
      ]);

      console.log('📊 Admin data loaded:', {
        stats: statsData,
        usersCount: users.length,
        artworksCount: artworks.length,
      });

      setStats(statsData);
      setAllUsers(users);
      setAllArtworks(artworks);
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
      alert('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const refreshArtworks = async () => {
    console.log('🔄 Refreshing artworks from database...');
    const artworks = await adminService.getAllArtworks();
    console.log('✅ Fresh artworks loaded:', artworks.length);
    setAllArtworks(artworks);
  };

  useEffect(() => {
    loadAdminData();
  }, []);
  
  useEffect(() => {
    if (managementView === 'artworks') {
      refreshArtworks();
    }
  }, [managementView]);

  return (
    <div style={styles.container} className="admin-container">
      <style>
        {`
          @media (max-width: 768px) {
            .admin-container {
              padding-top: 80px !important;
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
            
            .admin-header {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            
            .admin-metrics-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .admin-overview-section {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
            
            .admin-management-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .admin-activity-card,
            .admin-management-card,
            .admin-platform-stats {
              padding: 1.5rem !important;
            }
            
            .admin-section-title {
              font-size: 1.25rem !important;
              margin-bottom: 1rem !important;
            }
            
            .admin-stats-row {
              grid-template-columns: 1fr !important;
              gap: 0.5rem !important;
            }
            
            .admin-stats-label,
            .admin-stats-value {
              text-align: left !important;
            }
            
            .admin-title {
              font-size: 1.75rem !important;
            }
            
            .admin-table {
              overflow-x: auto !important;
            }
            
            .admin-management-button {
              padding: 1rem !important;
            }
            
            .admin-management-label {
              font-size: 0.875rem !important;
            }
            
            /* Modal Mobile Styles */
            .admin-modal-overlay {
              padding: 0.5rem !important;
            }
            
            .admin-modal-content {
              max-width: 100% !important;
              max-height: 95vh !important;
              border-radius: 1rem !important;
            }
            
            .admin-modal-header {
              padding: 1rem !important;
              flex-direction: row !important;
              gap: 0.5rem !important;
            }
            
            .admin-modal-title {
              font-size: 1.25rem !important;
            }
            
            .admin-modal-body {
              padding: 1rem !important;
            }
            
            /* User Management Table Mobile */
            .admin-table-header {
              display: none !important;
            }
            
            .admin-table-row {
              flex-direction: column !important;
              padding: 1rem !important;
              gap: 0.75rem !important;
              background: rgba(255, 255, 255, 0.05) !important;
              border-radius: 0.75rem !important;
              margin-bottom: 1rem !important;
            }
            
            .admin-table-row > span {
              flex: none !important;
              width: 100% !important;
            }
            
            .admin-user-info {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.5rem !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding-bottom: 0.75rem !important;
            }
            
            .admin-user-name {
              font-size: 1rem !important;
              font-weight: 600 !important;
              color: #fff !important;
            }
            
            .admin-user-email {
              font-size: 0.875rem !important;
              color: rgba(255, 255, 255, 0.6) !important;
            }
            
            .admin-user-meta {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              gap: 0.5rem !important;
            }
            
            .admin-user-actions {
              display: flex !important;
              gap: 0.5rem !important;
              justify-content: flex-end !important;
            }
            
            .admin-action-button {
              padding: 0.5rem 1rem !important;
              font-size: 1rem !important;
            }
            
            /* Artwork Moderation Mobile */
            .artwork-table-header {
              display: none !important;
            }
            
            .artwork-table-row {
              flex-direction: column !important;
              padding: 0 !important;
              gap: 0 !important;
              background: rgba(255, 255, 255, 0.05) !important;
              border-radius: 0.75rem !important;
              margin-bottom: 1rem !important;
              overflow: hidden !important;
            }
            
            .artwork-image-container {
              width: 100% !important;
              height: 200px !important;
              flex: none !important;
            }
            
            .artwork-image-mobile {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
            }
            
            .artwork-info-container {
              padding: 1rem !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .artwork-title-mobile {
              font-size: 1.125rem !important;
              font-weight: 600 !important;
              color: #fff !important;
              margin-bottom: 0.25rem !important;
            }
            
            .artwork-artist-mobile {
              font-size: 0.875rem !important;
              color: rgba(255, 255, 255, 0.6) !important;
              margin-bottom: 0.5rem !important;
            }
            
            .artwork-meta-row {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding-top: 0.75rem !important;
              border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            
            .artwork-price-mobile {
              font-size: 1.25rem !important;
              font-weight: 700 !important;
              color: #43e97b !important;
            }
            
            .artwork-delete-button {
              padding: 0.625rem 1.25rem !important;
              font-size: 0.875rem !important;
            }
            
            /* Pending Approvals Mobile */
            .approvals-table-header {
              display: none !important;
            }
            
            .approvals-table-row {
              flex-direction: column !important;
              padding: 1rem !important;
              gap: 0.75rem !important;
              background: rgba(255, 255, 255, 0.05) !important;
              border-radius: 0.75rem !important;
              margin-bottom: 1rem !important;
            }
            
            .approvals-seller-info {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.5rem !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding-bottom: 0.75rem !important;
            }
            
            .approvals-seller-name {
              font-size: 1rem !important;
              font-weight: 600 !important;
              color: #fff !important;
            }
            
            .approvals-seller-email {
              font-size: 0.875rem !important;
              color: rgba(255, 255, 255, 0.6) !important;
            }
            
            .approvals-seller-meta {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              gap: 0.5rem !important;
            }
            
            .approvals-artworks-count {
              font-size: 1rem !important;
              color: #667eea !important;
              font-weight: 600 !important;
            }
          }
        `}
      </style>
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Loading admin dashboard...</p>
        </div>
      ) : (
        <>
      <div style={styles.header} className="admin-header">
        <div>
          <h1 style={styles.title} className="admin-title">Admin Dashboard</h1>
          <p style={styles.subtitle}>Platform overview and management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onLogout && (
            <motion.button
              style={styles.loginButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
            >
              Logout
            </motion.button>
          )}
          <div style={styles.adminBadge}>
            <CheckCircle size={20} />
            Super Admin
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid} className="admin-metrics-grid">
        {[
          {
            title: 'Total Users',
            value: stats.totalUsers >= 1000 
              ? (stats.totalUsers / 1000).toFixed(1) + 'K' 
              : stats.totalUsers.toString(),
            change: `${stats.totalUsers} registered vs last\nmonth`,
            icon: Users,
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          },
          {
            title: 'Total Artworks',
            value: stats.totalArtworks >= 1000 
              ? (stats.totalArtworks / 1000).toFixed(1) + 'K' 
              : stats.totalArtworks.toString(),
            change: `${stats.totalArtworks} uploaded vs last\nmonth`,
            icon: Image,
            gradient: 'linear-gradient(135deg, #ff9a56 0%, #ffa756 100%)',
          },
          {
            title: 'Total Orders',
            value: stats.totalOrders >= 1000 
              ? (stats.totalOrders / 1000).toFixed(1) + 'K' 
              : stats.totalOrders.toString(),
            change: `${stats.totalOrders} items vs last\nmonth`,
            icon: ShoppingCart,
            gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
          },
          {
            title: 'Revenue',
            value: stats.revenue >= 1000000
              ? 'PKR\n' + (stats.revenue / 1000000).toFixed(1) + 'M'
              : stats.revenue >= 1000
                ? 'PKR\n' + (stats.revenue / 1000).toFixed(1) + 'K'
                : 'PKR\n' + stats.revenue,
            change: 'total earnings vs last\nmonth',
            icon: DollarSign,
            gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
          },
          {
            title: 'Active Buyers',
            value: stats.activeUsers >= 1000 
              ? (stats.activeUsers / 1000).toFixed(1) + 'K' 
              : stats.activeUsers.toString(),
            change: `${stats.activeUsers} buyers vs last\nmonth`,
            icon: Activity,
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          },
          {
            title: 'Total Sellers',
            value: stats.pendingApprovals.toString(),
            change: `${stats.pendingApprovals} sellers vs last\nmonth`,
            icon: AlertCircle,
            gradient: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{
              ...styles.metricCard,
              background: metric.gradient,
            }}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
          >
            <div style={styles.metricIcon}>
              <metric.icon size={28} />
            </div>
            <div style={styles.metricContent}>
              <p style={styles.metricTitle}>{metric.title}</p>
              <h3 style={styles.metricValue}>{metric.value}</h3>
              <div style={styles.metricChange}>
                <TrendingUp size={16} />
                <span>{metric.change} vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Management Overview */}
      <div style={styles.overviewSection} className="admin-overview-section">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={styles.activityCard}
          className="admin-activity-card"
        >
          <h3 style={styles.sectionTitle} className="admin-section-title">Recent Activity</h3>
          <div style={styles.activityList}>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.activityItem}
                whileHover={{ x: 5, background: 'rgba(255, 255, 255, 0.08)' }}
              >
                <div
                  style={{
                    ...styles.activityIcon,
                    background: getActivityColor(activity.type),
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div style={styles.activityContent}>
                  <p style={styles.activityDescription}>{activity.description}</p>
                  <p style={styles.activityTime}>{activity.timestamp}</p>
                </div>
              </motion.div>
            ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Management */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={styles.managementCard}
          className="admin-management-card"
        >
          <h3 style={styles.sectionTitle} className="admin-section-title">Quick Management</h3>
          <div style={styles.managementGrid} className="admin-management-grid">
            {[
              { label: 'User Management', icon: Users, color: '#fa709a', view: 'users' },
              { label: 'Artwork Moderation', icon: Image, color: '#ff9a56', view: 'artworks' },
              { label: 'Order Management', icon: ShoppingCart, color: '#a6c1ee', view: 'orders' },
              { label: 'Analytics', icon: Activity, color: '#fda085', view: 'analytics' },
              { label: 'Approvals', icon: CheckCircle, color: '#a8edea', view: 'approvals' },
              { label: 'Reports', icon: AlertCircle, color: '#ff6a88', view: 'reports' },
            ].map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                style={styles.managementButton}
                className="admin-management-button"
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 10px 30px ${item.color}40`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setManagementView(item.view)}
              >
                <div
                  style={{
                    ...styles.managementIcon,
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                  }}
                >
                  <item.icon size={24} />
                </div>
                <span style={styles.managementLabel} className="admin-management-label">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.platformStats}
        className="admin-platform-stats"
      >
        <h3 style={styles.sectionTitle} className="admin-section-title">Platform Statistics</h3>
        <div style={styles.statsTable}>
          <div style={styles.statsRow} className="admin-stats-row">
            <span style={styles.statsLabel} className="admin-stats-label">Conversion Rate</span>
            <div style={styles.statsBar}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '67%' }}
                transition={{ duration: 1, delay: 0.3 }}
                style={styles.statsBarFill}
              />
            </div>
            <span style={styles.statsValue} className="admin-stats-value">67%</span>
          </div>
          <div style={styles.statsRow} className="admin-stats-row">
            <span style={styles.statsLabel} className="admin-stats-label">User Engagement</span>
            <div style={styles.statsBar}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                transition={{ duration: 1, delay: 0.4 }}
                style={{
                  ...styles.statsBarFill,
                  background: 'linear-gradient(90deg, #ff9a56, #ffa756)',
                }}
              />
            </div>
            <span style={styles.statsValue} className="admin-stats-value">84%</span>
          </div>
          <div style={styles.statsRow} className="admin-stats-row">
            <span style={styles.statsLabel} className="admin-stats-label">Seller Satisfaction</span>
            <div style={styles.statsBar}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  ...styles.statsBarFill,
                  background: 'linear-gradient(90deg, #a8edea, #fed6e3)',
                }}
              />
            </div>
            <span style={styles.statsValue} className="admin-stats-value">92%</span>
          </div>
          <div style={styles.statsRow} className="admin-stats-row">
            <span style={styles.statsLabel} className="admin-stats-label">Buyer Retention</span>
            <div style={styles.statsBar}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1, delay: 0.6 }}
                style={{
                  ...styles.statsBarFill,
                  background: 'linear-gradient(90deg, #f6d365, #fda085)',
                }}
              />
            </div>
            <span style={styles.statsValue} className="admin-stats-value">78%</span>
          </div>
        </div>
      </motion.div>

      {/* Management View Modal */}
      {managementView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.modalOverlay}
          className="admin-modal-overlay"
          onClick={() => setManagementView(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            style={styles.modalContent}
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader} className="admin-modal-header">
              <h2 style={styles.modalTitle} className="admin-modal-title">
                {managementView === 'users' && 'User Management'}
                {managementView === 'artworks' && 'Artwork Moderation'}
                {managementView === 'orders' && 'Order Management'}
                {managementView === 'analytics' && 'Detailed Analytics'}
                {managementView === 'approvals' && 'Pending Approvals'}
                {managementView === 'reports' && 'System Reports'}
              </h2>
              <button onClick={() => setManagementView(null)} style={styles.closeButton}>
                ✕
              </button>
            </div>
            
            <div style={styles.modalBody} className="admin-modal-body">
              {managementView === 'users' && (
                <div>
                  <div style={styles.tableHeader} className="admin-table-header">
                    <span style={{flex: 1}}>Name</span>
                    <span style={{flex: 1}}>Email</span>
                    <span style={{flex: 0.7}}>Role</span>
                    <span style={{flex: 0.7}}>Status</span>
                    <span style={{flex: 0.8}}>Actions</span>
                  </div>
                  {allUsers.map((user) => (
                    <div key={user.uid} style={styles.tableRow} className="admin-table-row">
                      <div className="admin-user-info">
                        <span style={{flex: 1, fontWeight: 500}} className="admin-user-name">{user.name || user.displayName || user.email?.split('@')[0] || 'N/A'}</span>
                        <span style={{flex: 1, color: '#888'}} className="admin-user-email">{user.email}</span>
                      </div>
                      <div className="admin-user-meta">
                        <span style={{flex: 0.7}}>
                          <span style={{
                            ...styles.roleBadge,
                            background: user.role === 'seller' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 
                                       user.role === 'buyer' ? 'linear-gradient(135deg, #fa709a, #fee140)' :
                                       'linear-gradient(135deg, #43e97b, #38f9d7)',
                          }}>
                            {user.role}
                          </span>
                        </span>
                        <span style={{flex: 0.7, color: user.disabled ? '#ff6a88' : '#43e97b', fontWeight: 500}}>
                          {user.disabled ? 'Disabled' : 'Active'}
                        </span>
                      </div>
                      <div style={{flex: 0.8, display: 'flex', gap: '0.5rem'}} className="admin-user-actions">
                        <button
                          onClick={() => toggleUserStatus(user.uid)}
                          className="admin-action-button"
                          style={{
                            ...styles.actionButton,
                            background: user.disabled ? 'linear-gradient(135deg, #43e97b, #38f9d7)' : 'linear-gradient(135deg, #ffa726, #fb8c00)',
                          }}
                          title={user.disabled ? 'Enable User' : 'Disable User'}
                        >
                          {user.disabled ? '✓ Enable' : '⏸ Disable'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.uid)}
                          className="admin-action-button"
                          style={{
                            ...styles.actionButton,
                            background: 'linear-gradient(135deg, #ff6a88, #ff4757)',
                          }}
                          title="Delete User"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {managementView === 'artworks' && (
                <div>
                  <div style={styles.tableHeader} className="artwork-table-header">
                    <span style={{flex: 0.5}}>Image</span>
                    <span style={{flex: 1}}>Title</span>
                    <span style={{flex: 1}}>Artist</span>
                    <span style={{flex: 0.7}}>Price</span>
                    <span style={{flex: 0.7}}>Category</span>
                    <span style={{flex: 0.5}}>Action</span>
                  </div>
                  {allArtworks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
                      No artworks in database
                    </div>
                  ) : (
                    allArtworks.map((artwork) => (
                      <div key={artwork.id} style={styles.tableRow} className="artwork-table-row">
                        <div style={{flex: 0.5}} className="artwork-image-container">
                          <img 
                            src={artwork.imageUrl} 
                            alt={artwork.title}
                            style={styles.artworkThumb}
                            className="artwork-image-mobile"
                          />
                        </div>
                        <div className="artwork-info-container">
                          <div>
                            <div style={{flex: 1, fontWeight: 500}} className="artwork-title-mobile">{artwork.title}</div>
                            <div style={{flex: 1, color: '#888'}} className="artwork-artist-mobile">{artwork.artist}</div>
                          </div>
                          <div style={{flex: 0.7}}>
                            <span style={styles.categoryBadge}>{artwork.category}</span>
                          </div>
                          <div className="artwork-meta-row">
                            <span style={{flex: 0.7, color: '#43e97b', fontWeight: 600}} className="artwork-price-mobile">
                              PKR {artwork.price.toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteArtworkAdmin(artwork.id)}
                              style={{
                                ...styles.actionButton,
                                background: 'linear-gradient(135deg, #ff6a88, #ff4757)',
                              }}
                              className="artwork-delete-button"
                              title="Delete Artwork"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {managementView === 'orders' && (
                <div style={styles.emptyState}>
                  <ShoppingCart size={48} color="#888" />
                  <h3 style={{color: '#fff', marginTop: 20}}>Order Management</h3>
                  <p style={{color: '#888', marginTop: 10}}>
                    Total Artworks Listed: {allArtworks.length}<br/>
                    Total Value: R{allArtworks.reduce((sum, a) => sum + a.price, 0).toLocaleString()}
                  </p>
                </div>
              )}

              {managementView === 'analytics' && (
                <div>
                  <div style={styles.analyticsGrid}>
                    <div style={styles.analyticsCard}>
                      <Users size={32} color="#fa709a" />
                      <h3 style={{color: '#fff', fontSize: 32, margin: '15px 0 5px'}}>{stats.totalUsers}</h3>
                      <p style={{color: '#888'}}>Total Users</p>
                    </div>
                    <div style={styles.analyticsCard}>
                      <Image size={32} color="#667eea" />
                      <h3 style={{color: '#fff', fontSize: 32, margin: '15px 0 5px'}}>{stats.totalArtworks}</h3>
                      <p style={{color: '#888'}}>Total Artworks</p>
                    </div>
                    <div style={styles.analyticsCard}>
                      <DollarSign size={32} color="#43e97b" />
                      <h3 style={{color: '#fff', fontSize: 32, margin: '15px 0 5px'}}>
                        R{stats.revenue.toLocaleString()}
                      </h3>
                      <p style={{color: '#888'}}>Total Value</p>
                    </div>
                    <div style={styles.analyticsCard}>
                      <TrendingUp size={32} color="#fda085" />
                      <h3 style={{color: '#fff', fontSize: 32, margin: '15px 0 5px'}}>
                        {allUsers.filter(u => u.role === 'seller').length}
                      </h3>
                      <p style={{color: '#888'}}>Active Sellers</p>
                    </div>
                  </div>
                </div>
              )}

              {managementView === 'approvals' && (
                <div>
                  <div style={styles.tableHeader} className="approvals-table-header">
                    <span style={{flex: 1}}>Seller Name</span>
                    <span style={{flex: 1}}>Email</span>
                    <span style={{flex: 0.7}}>Artworks</span>
                    <span style={{flex: 0.7}}>Status</span>
                  </div>
                  {allUsers.filter(u => u.role === 'seller').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
                      No sellers found
                    </div>
                  ) : (
                    allUsers.filter(u => u.role === 'seller').map((seller) => {
                      const artworkCount = allArtworks.filter(a => a.artistId === seller.uid).length;
                      return (
                        <div key={seller.uid} style={styles.tableRow} className="approvals-table-row">
                          <div className="approvals-seller-info">
                            <span style={{flex: 1, fontWeight: 500}} className="approvals-seller-name">
                              {seller.name || seller.displayName || seller.email?.split('@')[0] || 'N/A'}
                            </span>
                            <span style={{flex: 1, color: '#888'}} className="approvals-seller-email">
                              {seller.email}
                            </span>
                          </div>
                          <div className="approvals-seller-meta">
                            <div>
                              <span style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginRight: '0.5rem'}}>Artworks:</span>
                              <span style={{flex: 0.7, color: '#667eea', fontWeight: 600}} className="approvals-artworks-count">
                                {artworkCount}
                              </span>
                            </div>
                            <span style={{flex: 0.7}}>
                              <span style={{
                                ...styles.statusBadge,
                                background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                              }}>
                                Approved
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {managementView === 'reports' && (
                <div style={styles.emptyState}>
                  <AlertCircle size={48} color="#888" />
                  <h3 style={{color: '#fff', marginTop: 20}}>System Reports</h3>
                  <p style={{color: '#888', marginTop: 10}}>
                    Platform Health: Excellent<br/>
                    Last Backup: Just now<br/>
                    Active Sessions: {allUsers.length}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
        </>
      )}
    </div>
  );
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'sale':
      return 'linear-gradient(135deg, #43e97b, #38f9d7)';
    case 'upload':
      return 'linear-gradient(135deg, #667eea, #764ba2)';
    case 'user':
      return 'linear-gradient(135deg, #f093fb, #f5576c)';
    case 'order':
      return 'linear-gradient(135deg, #4facfe, #00f2fe)';
    default:
      return 'linear-gradient(135deg, #fa709a, #fee140)';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <DollarSign size={20} />;
    case 'upload':
      return <Image size={20} />;
    case 'user':
      return <Users size={20} />;
    case 'order':
      return <ShoppingCart size={20} />;
    default:
      return <Activity size={20} />;
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #3d2817 0%, #6b4423 100%)',
    padding: '80px 1.5rem 2rem',
  },
  header: {
    maxWidth: '1600px',
    margin: '0 auto 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  adminBadge: {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#1a1a2e',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
  },
  loginButton: {
    background: 'transparent',
    color: '#d4af37',
    border: '2px solid rgba(212, 175, 55, 0.15)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  metricsGrid: {
    maxWidth: '1600px',
    margin: '0 auto 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  metricCard: {
    padding: '2rem',
    borderRadius: '1rem',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  },
  metricIcon: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '0.5rem',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  metricChange: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  overviewSection: {
    maxWidth: '1600px',
    margin: '0 auto 2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  activityCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1.5rem',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activityItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    transition: 'all 0.3s ease',
  },
  activityIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: '0.875rem',
    color: '#fff',
    marginBottom: '0.25rem',
    lineHeight: 1.5,
  },
  activityTime: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  managementCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  managementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  managementButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#fff',
  },
  managementIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  managementLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textAlign: 'center',
  },
  platformStats: {
    maxWidth: '1600px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  statsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr 80px',
    gap: '1rem',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500,
  },
  statsBar: {
    height: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  statsBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #fa709a, #fee140)',
    borderRadius: '9999px',
  },
  statsValue: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#fff',
    textAlign: 'right',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  modalContent: {
    background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.98))',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1.5rem',
    maxWidth: '1200px',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    padding: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.1), rgba(254, 225, 64, 0.1))',
  },
  modalTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  modalBody: {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1,
  },
  tableHeader: {
    display: 'flex',
    padding: '1rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'flex',
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '0.75rem',
    marginBottom: '0.75rem',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
  },
  roleBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
    display: 'inline-block',
    textTransform: 'capitalize',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
    display: 'inline-block',
  },
  categoryBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#fff',
    background: 'rgba(102, 126, 234, 0.3)',
    border: '1px solid rgba(102, 126, 234, 0.5)',
    display: 'inline-block',
  },
  artworkThumb: {
    width: '60px',
    height: '60px',
    borderRadius: '0.5rem',
    objectFit: 'cover',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    textAlign: 'center',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  analyticsCard: {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  actionButton: {
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #fa709a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.125rem',
    fontWeight: 500,
  },
};
