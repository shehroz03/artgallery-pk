import { db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'wishlist' | 'cart' | 'payment' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp | Date;
  metadata?: {
    artworkId?: string;
    orderId?: string;
    amount?: number;
    [key: string]: any;
  };
}

export const notificationService = {
  // Create a new notification
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    metadata?: Notification['metadata']
  ): Promise<string | null> {
    try {
      if (!userId) {
        console.error('❌ Cannot create notification: userId is required');
        return null;
      }

      console.log('📝 Creating notification:', { userId, type, title, message, metadata });
      const notificationData = {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: serverTimestamp(),
        metadata: metadata || {},
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('✅ Notification created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ Error creating notification:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        console.error('🚫 Firestore permission denied. Check Firestore rules for notifications collection.');
        console.error('Required rule: allow create: if isAuthenticated();');
      } else if (error.code === 'failed-precondition') {
        console.error('📊 Composite index required. Run: firebase deploy --only firestore:indexes');
      }
      
      return null;
    }
  },

  // Subscribe to real-time notifications for a user
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    try {
      // Query without orderBy to avoid index requirement
      // We'll sort on client side instead
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifications: Notification[] = [];
          snapshot.forEach((doc) => {
            notifications.push({
              id: doc.id,
              ...doc.data(),
            } as Notification);
          });
          
          // Sort on client side by createdAt (newest first)
          notifications.sort((a, b) => {
            const aTime = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt as any);
            const bTime = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt as any);
            return bTime.getTime() - aTime.getTime();
          });
          
          console.log('🔔 Notifications received and sorted (client-side):', notifications.length);
          callback(notifications);
        },
        (error) => {
          console.error('❌ Error subscribing to notifications:', error);
          console.error('Error details:', error.message);
          
          // If it's an index error, provide helpful message
          if (error.message?.includes('index')) {
            console.error('📝 To fix: Click the link above to create the index in Firebase Console');
            console.error('📝 Or deploy indexes: firebase deploy --only firestore:indexes');
          }
          
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up notifications subscription:', error);
      return () => {};
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map((document) =>
        updateDoc(doc(db, 'notifications', document.id), { read: true })
      );

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Delete all notifications for a user
  async deleteAllNotifications(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((document) =>
        deleteDoc(doc(db, 'notifications', document.id))
      );

      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  },

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },
};
