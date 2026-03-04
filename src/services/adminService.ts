import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export interface AdminStats {
  totalUsers: number;
  totalArtworks: number;
  totalOrders: number;
  revenue: number;
  activeUsers: number;
  pendingApprovals: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface User {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  role: 'buyer' | 'seller' | 'admin';
  disabled?: boolean;
  createdAt?: string;
  photoURL?: string;
}

export const adminService = {
  // Get all users from Firestore
  async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      usersSnapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() } as User);
      });
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get all artworks from Firestore
  async getAllArtworks(): Promise<any[]> {
    try {
      const artworksSnapshot = await getDocs(collection(db, 'artworks'));
      const artworks: any[] = [];
      artworksSnapshot.forEach((doc) => {
        artworks.push({ id: doc.id, ...doc.data() });
      });
      return artworks;
    } catch (error) {
      console.error('Error fetching artworks:', error);
      return [];
    }
  },

  // Get all orders from Firestore
  async getAllOrders(): Promise<any[]> {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders: any[] = [];
      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Get admin dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const [users, artworks, orders] = await Promise.all([
        this.getAllUsers(),
        this.getAllArtworks(),
        this.getAllOrders(),
      ]);

      const buyers = users.filter(u => u.role === 'buyer');
      const sellers = users.filter(u => u.role === 'seller');
      
      // Calculate total revenue from all orders
      const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Generate recent activity from real data - combine all activities
      const allActivities: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        dateTime: number;
      }> = [];
      
      // Add all orders with timestamps
      orders.forEach((order) => {
        // Handle Firestore Timestamp properly
        let dateTime: number;
        if (order.createdAt?.toDate && typeof order.createdAt.toDate === 'function') {
          dateTime = order.createdAt.toDate().getTime();
        } else if (order.createdAt instanceof Date) {
          dateTime = order.createdAt.getTime();
        } else if (typeof order.createdAt === 'string') {
          dateTime = new Date(order.createdAt).getTime();
        } else {
          dateTime = 0; // Default to epoch if no valid timestamp
        }
        
        const timeAgo = this.getTimeAgo(order.createdAt);
        allActivities.push({
          id: `order-${order.id}`,
          type: 'order',
          description: `New order placed: PKR ${order.totalAmount?.toLocaleString()}`,
          timestamp: timeAgo,
          dateTime,
        });
      });

      // Add all artworks with timestamps
      artworks.forEach((art) => {
        // Handle Firestore Timestamp properly
        let dateTime: number;
        if (art.createdAt?.toDate && typeof art.createdAt.toDate === 'function') {
          dateTime = art.createdAt.toDate().getTime();
        } else if (art.createdAt instanceof Date) {
          dateTime = art.createdAt.getTime();
        } else if (typeof art.createdAt === 'string') {
          dateTime = new Date(art.createdAt).getTime();
        } else {
          dateTime = 0;
        }
        
        const timeAgo = this.getTimeAgo(art.createdAt);
        allActivities.push({
          id: `art-${art.id}`,
          type: 'artwork',
          description: `New artwork "${art.title}" uploaded by ${art.artist || 'Unknown'}`,
          timestamp: timeAgo,
          dateTime,
        });
      });

      // Add all users with timestamps
      users.forEach((user) => {
        // Handle Firestore Timestamp properly
        let dateTime: number;
        const createdAt = user.createdAt as any;
        if (createdAt && typeof createdAt.toDate === 'function') {
          dateTime = createdAt.toDate().getTime();
        } else if (createdAt instanceof Date) {
          dateTime = createdAt.getTime();
        } else if (typeof user.createdAt === 'string') {
          dateTime = new Date(user.createdAt).getTime();
        } else {
          dateTime = 0;
        }
        
        const timeAgo = this.getTimeAgo(user.createdAt);
        allActivities.push({
          id: `user-${user.uid}`,
          type: 'user',
          description: `New ${user.role} registered: ${user.name || user.displayName || user.email}`,
          timestamp: timeAgo,
          dateTime,
        });
      });

      // Sort all activities by dateTime (newest first) and take top 7
      const recentActivity = allActivities
        .sort((a, b) => b.dateTime - a.dateTime)
        .slice(0, 7)
        .map(({ dateTime, ...activity }) => activity); // Remove dateTime from final result

      console.log('📊 Admin stats calculated:', {
        totalUsers: users.length,
        totalArtworks: artworks.length,
        totalOrders: orders.length,
        revenue,
        activeBuyers: buyers.length,
        totalSellers: sellers.length,
      });

      return {
        totalUsers: users.length,
        totalArtworks: artworks.length,
        totalOrders: orders.length,
        revenue,
        activeUsers: buyers.length, // Active Buyers count
        pendingApprovals: sellers.length, // Total Sellers count
        recentActivity, // Already limited to 7 activities
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        totalArtworks: 0,
        totalOrders: 0,
        revenue: 0,
        activeUsers: 0,
        pendingApprovals: 0,
        recentActivity: [],
      };
    }
  },

  // Helper function to calculate time ago
  getTimeAgo(timestamp: any): string {
    if (!timestamp) return 'Just now';
    
    try {
      // Handle Firestore Timestamp
      let date: Date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        // Fallback for other timestamp formats
        date = new Date(timestamp);
      }
      
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // If negative or invalid, return just now
      if (seconds < 0 || isNaN(seconds)) return 'Just now';
      
      if (seconds < 60) return 'Just now';
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
      
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
      
      const years = Math.floor(months / 12);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Just now';
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', userId));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // Toggle user status (enable/disable)
  async toggleUserStatus(userId: string, disabled: boolean): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), { disabled });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  },

  // Delete artwork
  async deleteArtwork(artworkId: string): Promise<boolean> {
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'artworks', artworkId));
      return true;
    } catch (error) {
      console.error('Error deleting artwork:', error);
      return false;
    }
  },
};
